import * as utils from '$lib/utils';
import { prisma } from './client';

export async function lang(id: string, lang?: string) {
	const client_version = await utils.lang(id, lang);
	if (client_version) return client_version;
	return (await prisma.editableLang.findFirst({ where: { id, lang } }))?.value || id;
}
