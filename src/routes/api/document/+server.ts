import type { RequestHandler } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';
import { json } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import { create, read, write } from '$lib/server/file';
import { prisma } from '$lib/server/client';
import type { IconMeta } from '$lib/types';
import {
	default_icon,
	mapNumberToVisiblity,
	mapVisibilityToNumber,
	type DocumentMeta
} from '$lib/document';

export const GET: RequestHandler = async (event) => {
	const document_id = event.url.searchParams.get('document_id');
	if (!document_id) {
		error(400, { message: 'missing_required_params_fail' });
	}

	// Main document
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

	const token = event.cookies.get(auth.sessionCookieName);

	if (document.visibility === -1) {
		if (!token) {
			error(400, { message: 'account_needed_fail' });
		}

		const user = await auth.validateSessionToken(token).then((v) => v.user);

		if (!user) {
			error(400, { message: 'account_needed_fail' });
		}

		if (user.id !== document.authorId) {
			error(400, { message: 'document_exist_fail' });
		}
	}

	let title = document.title;
	let authorId = document.authorId;
	let author = document.author.name;
	let visibility = mapNumberToVisiblity(document.visibility);
	let tags = document.DocumentTagOnDocument.map((v) => v.tag.id);
	let id = document.id;
	let icon = document.icon
		? (JSON.parse(document.icon) as IconMeta)
		: {
				library: 'lucide',
				value: 'Image'
			};

	let created = document.created;
	let updated = document.updated;

	let meta: DocumentMeta = {
		title,
		author,
		authorId,
		id,
		tags,
		icon,
		visibility,
		updated,
		created
	};

	return json({
		ok: 1,
		meta: meta
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

	let { meta }: { meta: DocumentMeta } = await event.request.json();

	const canWrite =
		(await prisma.document.findFirst({ where: { id: meta.id } }).then((v) => v?.authorId)) ===
		user.id;

	if (!canWrite) {
		error(400, { message: 'document_exist_fail' });
	}

	await prisma.document.update({
		where: { id: meta.id },
		data: {
			title: meta.title,
			visibility: mapVisibilityToNumber(meta.visibility),
			icon: meta.icon ? JSON.stringify(meta.icon) : undefined,
			updated: new Date()
		}
	});

	await prisma.documentTagOnDocument.deleteMany({ where: { DocumentId: meta.id } });

	await Promise.all(
		meta.tags.map((tag) =>
			prisma.documentTagOnDocument.create({
				data: { DocumentId: meta.id, DocumentTagId: tag }
			})
		)
	);

	return json({ ok: 1, meta });
};
