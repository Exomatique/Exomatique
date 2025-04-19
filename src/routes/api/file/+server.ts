import { getDocumentConsideringAccess } from '$lib/server/access';
import { sessionCookieName } from '$lib/server/auth';
import { read, write, remove } from '$lib/server/file/server_fs';
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

	const file = await read(address);

	if (!file) {
		return error(400, { message: 'file_exist_fail' });
	}

	return json({ ok: 1, data: file });
};

export const POST: RequestHandler = async (event) => {
	const { document_id, path, type, data } = await event.request.json();

	if (
		!document_id ||
		path == undefined ||
		!((data != null && type != null) || (data == null && type == null))
	) {
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

	if (data != null && type != null) {
		const file = await write(address, type, data);
		if (!file) {
			return error(400, { message: 'fail' });
		}
		return json({ ok: 1, file });
	}

	const file = await remove(address);

	if (!file) {
		return error(400, { message: 'fail' });
	}

	return json({ ok: 1 });
};
