import { error, json, type RequestHandler } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';
import { prisma } from '$lib/server/client';
import { list_files, mkdir } from '$lib/server/file';

function isFileBlacklist(path: string, file: string): boolean {
	if (!file.includes('.')) return true;
	if (file.endsWith('.meta.json')) return true;
	return false;
}

export const GET: RequestHandler = async (event) => {
	const document_id = event.url.searchParams.get('document_id');
	let url = event.url.searchParams.get('url');

	if (!document_id || url == undefined) {
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

	if (url.startsWith('/')) url = url.substring(1);
	if (url.endsWith('/')) url = url.substring(0, url.length - 1);

	const files = await list_files(document_id, url);

	if (files === undefined) {
		error(400, { message: 'document_url_malformed' });
	}

	return json({
		ok: 1,
		data: files.filter((path) => {
			const file = path.includes('/') ? path.substring(path.lastIndexOf('/') + 1) : path;

			return !isFileBlacklist(path, file);
		})
	});
};

export const POST: RequestHandler = async (event) => {
	let { document_id, url }: { document_id: string; url: string } = await event.request.json();

	if (!document_id || url == undefined) {
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

	const token = event.cookies.get(auth.sessionCookieName);

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

	let mkdir_error = false;
	await mkdir(document_id, url).catch(() => (mkdir_error = true));

	if (mkdir_error) {
		error(400, { message: 'fail' });
	}

	return json({ ok: 1 });
};
