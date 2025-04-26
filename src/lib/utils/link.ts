import { getChildAddress, getFileName, getParentAddress } from '$lib/file/distant_fs';
import type { FileAddress } from '$lib/file/types';

export function simplifyPageAddress(address: FileAddress): FileAddress {
	let resolved = resolvePageAddress(address);

	let name = getFileName(resolved);

	if (name === 'index.page') {
		return getParentAddress(address);
	}

	if (name.endsWith('.page')) {
		return getChildAddress(
			getParentAddress(resolved),
			name.substring(0, name.length - '.page'.length)
		);
	}

	return resolved;
}

export function resolvePageAddress(address: FileAddress): FileAddress {
	if (address.path.endsWith('.page')) {
		return address;
	}

	if (address.path.endsWith('/')) {
		return { ...address, path: address.path + 'index.page' };
	}

	const name = getFileName(address);
	if (name.includes('.')) {
		return address;
	}
	return { ...address, path: address.path + '.page' };
}
