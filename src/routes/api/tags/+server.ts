import type { RequestHandler } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';
import { json } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import { create, read, write } from '$lib/server/file';
import { prisma } from '$lib/server/client';
import { tags } from '$lib/document/tags';
import { lang } from '$lib/server/utils';

export const GET: RequestHandler = async (event) => {
	const lang_key = event.cookies.get('paraglide_lang') || 'en';

	for (const tag of tags) {
		if ((await prisma.documentTag.count({ where: { id: tag } })) == 0)
			await prisma.documentTag.create({ data: { id: tag } });
	}

	const data = await Promise.all(
		(await prisma.documentTag.findMany()).map(async (v) => {
			return { value: v.id, label: await lang(v.id, lang_key) };
		})
	);

	return json({ ok: 1, data });
};

export const POST: RequestHandler = async (event) => {
	return json({ ok: 1 });
};
