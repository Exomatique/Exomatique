import { getDocumentConsideringAccess } from '$lib/server/access';
import { sessionCookieName } from '$lib/server/auth';
import { prisma } from '$lib/server/client';
import { getMeta, setMeta } from '$lib/server/file/server_fs';
import { error, json, type RequestHandler } from '@sveltejs/kit';

// Return file meta from file address
export const GET: RequestHandler = async (event) => {
	const document_id = event.url.searchParams.get('document_id');
	const path = event.url.searchParams.get('path');

	if (!document_id || path == undefined) {
		return error(400, { message: 'missing_required_params_fail' });
	}

	// Check if document is accessible
	const document = getDocumentConsideringAccess(document_id, event.cookies.get(sessionCookieName));

	if (!document) {
		return error(400, { message: 'document_exist_fail' });
	}

	const address = {
		document_id,
		path
	};

	const meta = await getMeta(address);

	if (!meta) {
		return error(400, { message: 'file_exist_fail' });
	}

	return json({ ok: 1, meta });
};

export const POST: RequestHandler = async (event) => {
	const { document_id, path, meta } = await event.request.json();

	if (!document_id || path == undefined || !meta) {
		return error(400, { message: 'missing_required_params_fail' });
	}
	// Check if document is accessible
	const document = getDocumentConsideringAccess(document_id, event.cookies.get(sessionCookieName));

	if (!document) {
		return error(400, { message: 'document_exist_fail' });
	}

	const address = {
		document_id,
		path
	};

	const new_meta = await setMeta(address, meta);

	if (!new_meta) {
		return error(400, { message: 'file_exist_fail' });
	}

	return json({ ok: 1, meta: new_meta });
};
