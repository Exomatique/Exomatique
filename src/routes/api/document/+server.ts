import type { RequestHandler } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';
import { json } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import { create, read, write } from '$lib/server/file';
import { prisma } from '$lib/server/client';
import type { IconMeta } from '$lib/types';

export const GET: RequestHandler = async (event) => {
	const document_id = event.url.searchParams.get('document_id');
	const url = event.url.searchParams.get('url');

	if (!document_id || !url) {
		error(400, { message: 'missing_required_params_fail' });
	}

	const document = await prisma.document.findFirst({
		where: { id: document_id },
		include: {
			author: true,
			DocumentTagOnDocument: { include: { tag: true } }
		}
	});

	if (!document) {
		error(400, { message: 'document_exist_fail' });
	}

	if (document.visibility === -1) {
		const token = event.cookies.get(auth.sessionCookieName);

		if (!token) {
			error(400, { message: 'account_needed_fail' });
		}

		const user = await auth.validateSessionToken(token).then((v) => v.user);

		if (!user) {
			error(400, { message: 'account_needed_fail' });
		}
	}

	const data = await read(document_id, url);

	let title = document.title;
	let authorId = document.authorId;
	let author = document.author.name;
	let visibility = document.visibility;
	let tags = document.DocumentTagOnDocument.map((v) => v.tag.id);
	let id = document.id;
	let icon = document.icon
		? (JSON.parse(document.icon) as IconMeta)
		: {
				library: 'lucide',
				value: 'Image'
			};
	let tree = document.tree;

	return json({
		ok: 1,
		title,
		data,
		author,
		authorId,
		id,
		tags,
		icon,
		visibility,
		tree
	});
};

export const POST: RequestHandler = async (event) => {
	const token = event.cookies.get(auth.sessionCookieName);

	if (!token) {
		error(400, { message: 'account_needed_fail' });
	}

	const user = await auth.validateSessionToken(token).then((v) => v.user);

	if (!user) {
		error(400, { message: 'account_needed_fail' });
	}

	const { document_id, data, title, tags, visibility, icon, tree } = await event.request.json();

	await Promise.all(
		(data as { url: string; data: string }[]).map(
			async ({ url, data }) => await write(document_id, url, data)
		)
	);

	await prisma.document.update({
		where: { id: document_id },
		data: {
			title,
			visibility,
			icon: icon ? JSON.stringify(icon) : undefined,
			updated: new Date(),
			tree
		}
	});

	await prisma.documentTagOnDocument.deleteMany({ where: { DocumentId: document_id } });
	for await (const tag of tags) {
		await prisma.documentTagOnDocument.create({
			data: { DocumentId: document_id, DocumentTagId: tag }
		});
	}

	return json({ ok: 1, data });
};
