import type { FileAddress } from '$lib/file/types';
import { simplifyPageAddress } from '$lib/utils/link';

export function href(address: FileAddress, edit?: boolean) {
	return (
		'/documents/d/' +
		address.document_id +
		(edit ? '/edit/' : '/') +
		simplifyPageAddress(address).path.substring(1)
	);
}
