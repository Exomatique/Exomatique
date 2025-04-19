import { getChildAddress, getRootAddress, write } from '$lib/file/distant_fs';
import type { PageData } from '$lib/page';

export default async function initializeDocument(document_id: string): Promise<void> {
	const address = getRootAddress(document_id);

	const index_address = getChildAddress(address, 'index.page');
	await write(index_address, 'page', { content: [] } satisfies PageData);
}
