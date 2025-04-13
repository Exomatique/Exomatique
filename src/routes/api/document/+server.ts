import type { RequestHandler } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';
import { json } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import { create, read, write } from '$lib/server/file';
import { prisma } from '$lib/server/client';

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

	const data = JSON.parse((await read(document_id, url)) || '[]');

	let title = document.title;
	let authorId = document.authorId;
	let author = document.author.name;
	let visibility = document.visibility;
	let tags = document.DocumentTagOnDocument.map((v) => v.tag.id);
	let id = document.id;

	return json({
		ok: 1,
		title,
		data,
		author,
		authorId,
		id,
		tags,
		visibility
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

	const { document_id, url, data, title, tags, visibility } = await event.request.json();

	await write(document_id, url, JSON.stringify(data));
	await prisma.document.update({
		where: { id: document_id },
		data: { title, visibility, updated: new Date() }
	});

	await prisma.documentTagOnDocument.deleteMany({ where: { DocumentId: document_id } });
	for await (const tag of tags) {
		await prisma.documentTagOnDocument.create({
			data: { DocumentId: document_id, DocumentTagId: tag }
		});
	}

	return json({ ok: 1, data });
};
