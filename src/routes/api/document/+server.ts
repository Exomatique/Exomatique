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

	const document = await prisma.document.findFirst({ where: { id: document_id } });

	if (document?.visibility === -1) {
		const token = event.cookies.get(auth.sessionCookieName);

		if (!token) {
			error(400, { message: 'account_needed_fail' });
		}
		const user = await auth.validateSessionToken(token).then((v) => v.user);

		if (!user) {
			error(400, { message: 'account_needed_fail' });
		}

		if (document.authorId !== user.id) {
			error(400, { message: 'document_private_wrong_acccount_fail' });
		}
	}

	const title = (await prisma.document.findFirst({ where: { id: document_id } }))?.title;
	const data = JSON.parse((await read(document_id, url)) || '[]');

	return json({ ok: 1, title, data });
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

	const { document_id, url, data, title, visibility } = await event.request.json();

	await write(document_id, url, JSON.stringify(data));
	await prisma.document.update({ where: { id: document_id }, data: { title, visibility } });

	return json({ ok: 1, data });
};
