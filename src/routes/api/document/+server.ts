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

function simplify_url(url: string): string {
	url = resolve_url(url);
	const file_no_extension = url.includes('.') ? url.substring(0, url.lastIndexOf('.')) : url;

	return url === 'index.json' ? '' : url.endsWith('.json') ? file_no_extension : url;
}

function resolve_url(url: string): string {
	if (url.trim().length === 0) return 'index.json';
	if (url.includes('.')) return url;
	return url + '.json';
}

export const GET: RequestHandler = async (event) => {
	const document_id = event.url.searchParams.get('document_id');
	const url = event.url.searchParams.get('url');

	if (!document_id || url == undefined) {
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
		url,
		author,
		authorId,
		id,
		tags,
		icon,
		visibility,
		updated,
		created
	};

	const resolved = resolve_url(meta.url);
	const simplified_url = simplify_url(resolved);

	const file_no_extension = resolved.includes('.')
		? resolved.substring(0, resolved.lastIndexOf('.'))
		: resolved;

	if (resolved === 'index.json') {
		const data = await read(document_id, resolved);

		return json({
			ok: 1,
			meta,
			data
		});
	}

	// Check whether url have a document meta

	const meta_file = file_no_extension + '.meta.json';

	meta = await read(document_id, meta_file).then((v) =>
		!v || v?.length === 0 ? meta : (JSON.parse(v) as DocumentMeta)
	);

	if (meta.visibility === 'PRIVATE') {
		if (!token) {
			error(400, { message: 'account_needed_fail' });
		}

		const user = await auth.validateSessionToken(token).then((v) => v.user);

		if (!user) {
			error(400, { message: 'account_needed_fail' });
		}

		if (user.id !== meta.authorId) {
			error(400, { message: 'document_exist_fail' });
		}
	}

	const data = await read(document_id, resolved);

	return json({
		ok: 1,
		meta: { ...meta, url: simplified_url },
		data
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

	let { meta, data }: { meta: DocumentMeta; data: string } = await event.request.json();

	const resolved = resolve_url(meta.url);

	const file_no_extension = resolved.includes('.')
		? resolved.substring(0, resolved.lastIndexOf('.'))
		: resolved;

	const simplified_url = simplify_url(resolved);

	const canWrite =
		(await prisma.document.findFirst({ where: { id: meta.id } }).then((v) => v?.authorId)) ===
		user.id;

	if (!canWrite) {
		error(400, { message: 'document_exist_fail' });
	}

	if (resolved === 'index.json') {
		await write(meta.id, resolved, data);

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

		return json({ ok: 1, data, meta: { ...meta, url: simplified_url } });
	}

	const meta_file = file_no_extension + '.meta.json';

	let ancient_meta: DocumentMeta = await read(meta.id, meta_file).then((v) =>
		!v || v?.length === 0
			? ({
					title: '',
					url: file_no_extension,
					author: meta.author,
					authorId: meta.authorId,
					id: meta.id,
					tags: [],
					icon: default_icon,
					visibility: 'PRIVATE',
					updated: new Date(),
					created: new Date()
				} as DocumentMeta)
			: (JSON.parse(v) as DocumentMeta)
	);

	let new_meta: DocumentMeta = {
		...ancient_meta,
		title: meta.title,
		visibility: meta.visibility,
		updated: new Date(),
		icon: meta.icon,
		tags: meta.tags
	};

	await write(meta.id, resolved, data);
	await write(meta.id, meta_file, JSON.stringify(new_meta));

	return json({ ok: 1, data, meta: { ...new_meta, url: simplified_url } });
};
