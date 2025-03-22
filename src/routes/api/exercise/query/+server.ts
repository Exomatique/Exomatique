import type { RequestHandler } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';
import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/client';

export const GET: RequestHandler = async (event) => {
	const token = event.cookies.get(auth.sessionCookieName);

	let user;
	if (token) {
		user = await auth.validateSessionToken(token).then((v) => v.user);
	}

	let title = event.url.searchParams.get('title') || '';
	let tags: string[] = event.url.searchParams.getAll('tag').filter((v) => v.length != 0) || [];
	let skip = Number.parseInt(event.url.searchParams.get('skip') || '0');
	let size = Math.min(Number.parseInt(event.url.searchParams.get('size') || '20'), 20);

	let count = 0;
	const data = (
		await prisma.exercise.findMany({
			skip,
			take: size,
			include: {
				_count: true,
				document: {
					include: {
						author: true
					}
				},
				ExerciseTagOnExercise: {
					include: {
						tag: true
					}
				}
			},
			where: {
				OR: [
					{
						document: {
							authorId: user?.id || ''
						}
					},
					{
						document: {
							visibility: 1
						}
					}
				],
				document: {
					title: {
						startsWith: title
					}
				},
				AND: tags.map((tag) => {
					return {
						ExerciseTagOnExercise: {
							some: {
								tag: {
									id: tag
								}
							}
						}
					};
				})
			}
		})
	).map((v) => {
		count = v._count.document;
		return {
			title: v.document.title,
			authorId: v.document.authorId,
			author: v.document.author.name,
			visibility: v.document.visibility,
			tags: v.ExerciseTagOnExercise.map((v) => v.tag.id),
			id: v.id
		};
	});

	return json({ ok: 1, data, amount: count });
};
