import { error } from '@sveltejs/kit';
import { prisma } from './client';
import { validateSessionToken } from './auth';

export async function getDocumentConsideringAccess(
	document_id: string,
	token?: string
): Promise<any | undefined> {
	const document = await prisma.document.findFirst({
		where: { id: document_id },
		include: {}
	});

	if (!document) {
		return error(400, { message: 'document_exist_fail' });
	}

	if (document.visibility === -1) {
		if (!token) {
			return error(400, { message: 'account_needed_fail' });
		}

		const user = await validateSessionToken(token).then((v) => v.user);

		if (!user) {
			return error(400, { message: 'account_needed_fail' });
		}

		if (user.id !== document.authorId) {
			return error(400, { message: 'document_exist_fail' });
		}
	}

	return document;
}
