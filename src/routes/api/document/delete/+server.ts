import type { RequestHandler } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';
import { json } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import { create, read, write } from '$lib/server/file';
import { prisma } from '$lib/server/client';

export const POST: RequestHandler = async (event) => {
	const token = event.cookies.get(auth.sessionCookieName);

	if (!token) {
		error(400, { message: 'account_needed_fail' });
	}

	const user = await auth.validateSessionToken(token).then((v) => v.user);

	if (!user) {
		error(400, { message: 'account_needed_fail' });
	}

	const { document_id } = await event.request.json();

	const document = await prisma.document.findFirst({ where: { id: document_id } });

	if (!document) {
		error(400, { message: 'document_exist_fail' });
	}

	if (document.authorId !== user.id) {
		error(400, { message: 'document_confirm_permission_fail' });
	}

	await prisma.document.delete({ where: { id: document_id, authorId: user.id } });

	return json({ ok: 1 });
};
