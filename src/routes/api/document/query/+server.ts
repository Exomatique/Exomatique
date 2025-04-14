import type { RequestHandler } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';
import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/client';
import { updated } from '$app/state';

export const GET: RequestHandler = async (event) => {
	const token = event.cookies.get(auth.sessionCookieName);

	let user;
	if (token) {
		user = await auth.validateSessionToken(token).then((v) => v.user);
	}

	let title = event.url.searchParams.get('title') || '';
	let author = event.url.searchParams.get('author') || '';
	let skip = Number.parseInt(event.url.searchParams.get('skip') || '0');
	let size = Math.min(Number.parseInt(event.url.searchParams.get('size') || '20'), 20);

	let count = 0;
	const data = (
		await prisma.document.findMany({
			skip,
			take: size,
			include: {
				author: true,
				DocumentTagOnDocument: {
					include: {
						tag: true
					}
				}
			},
			where: {
				OR: [
					{
						authorId: user?.id || ''
					},
					{
						visibility: 1
					}
				],
				title: {
					startsWith: title
				},
				author: author
					? {
							id: author
						}
					: undefined
			}
		})
	).map((v) => {
		return {
			title: v.title,
			authorId: v.authorId,
			author: v.author.name,
			visibility: v.visibility,
			tags: v.DocumentTagOnDocument.map((v) => v.tag.id),
			created: v.created,
			updated: v.updated,
			icon: v.icon
				? JSON.parse(v.icon)
				: {
						library: 'lucide',
						value: 'Image'
					},
			id: v.id
		};
	});

	return json({ ok: 1, data, amount: count });
};
