import { get, post } from '$lib/utils';
import { resolvePageAddress } from '$lib/utils/link';
import {
	doesFileDataTypeMatchType,
	type File,
	type FileAddress,
	type FileData,
	type FileMeta,
	type FileType
} from './types';

export function getRootAddress(document_id: string): FileAddress {
	return {
		document_id,
		path: '/'
	};
}

export function getChildAddress(address: FileAddress, child: string): FileAddress {
	if (address.path === '') {
		return { ...address, path: child };
	}

	if (address.path.endsWith('/')) {
		return { ...address, path: `${address.path}${child}` };
	}

	return { ...address, path: `${address.path}/${child}` };
}

export function getParentAddress(address: FileAddress): FileAddress {
	if (address.path === '') {
		return address;
	}
	const lastSlash = address.path.lastIndexOf('/', address.path.length - 2);
	// If last character is a slash, we need to ignore it
	if (lastSlash === -1) {
		return { ...address, path: '' };
	}
	return { ...address, path: address.path.substring(0, lastSlash + 1) };
}

export function ensureDirPath(address: FileAddress): FileAddress {
	if (address.path.endsWith('/')) {
		return address;
	}
	return { ...address, path: address.path + '/' };
}

export function isDirAddress(address: FileAddress): boolean {
	if (address.path.endsWith('/')) {
		return true;
	}
	const name = getFileName(address);

	return !name.includes('.');
}

export function getFilePath(address: FileAddress): string {
	let path = address.path;
	if (path.startsWith('/')) {
		path = path.substring(1);
	}
	return `${address.document_id}/${path}`;
}

export function isFileHidden(address: FileAddress): boolean {
	let path = getFilePath(address);

	const file_name = path.substring(path.lastIndexOf('/') + 1);

	if (path.endsWith('.meta')) return true;

	return file_name.startsWith('.');
}

export function getFileName(address: FileAddress): string {
	if (!address.path.includes('/')) {
		return address.path;
	}

	return address.path.substring(address.path.lastIndexOf('/') + 1);
}

export async function getMeta(address: FileAddress): Promise<FileMeta | undefined> {
	if (isFileHidden(address)) {
		return undefined;
	}

	const resolved_address = getFileName(address).includes('.') ? address : ensureDirPath(address);

	return get('/file/meta', { ...resolved_address }).then((res) => {
		if (res.ok !== 1) {
			throw new Error('Failed to get file meta');
		}
		return res.meta;
	});
}

export async function setMeta(address: FileAddress, meta: FileMeta): Promise<FileMeta | undefined> {
	if (isFileHidden(address)) {
		return undefined;
	}

	const resolved_address = getFileName(address).includes('.') ? address : ensureDirPath(address);

	return post('/file/meta', { ...resolved_address, meta }).then((res) => {
		if (res.ok !== 1) {
			throw new Error('Failed to set file meta');
		}
		return res.meta;
	});
}

export async function read(address: FileAddress, type?: FileType): Promise<File | undefined> {
	if (isFileHidden(address)) {
		return undefined;
	}

	const resolved_address =
		type === 'page'
			? resolvePageAddress(address)
			: type === 'directory'
				? ensureDirPath(address)
				: address;

	return get('/file', { ...resolved_address }).then((res) => {
		if (res.ok !== 1) {
			throw new Error('Failed to read file');
		}
		return res.data;
	});
}

export async function write(
	address: FileAddress,
	type: FileType,
	data: FileData
): Promise<File | undefined> {
	if (isFileHidden(address)) {
		return undefined;
	}

	if (!doesFileDataTypeMatchType(type, data)) {
		throw new Error('File data type does not match file type');
	}

	const resolved_address =
		type === 'page'
			? resolvePageAddress(address)
			: type === 'directory'
				? ensureDirPath(address)
				: address;

	return post('/file', { ...resolved_address, type, data }).then((res) => {
		if (res.ok !== 1) {
			throw new Error('Failed to write file');
		}
		return res.data;
	});
}

export async function remove(address: FileAddress): Promise<boolean | undefined> {
	if (isFileHidden(address)) {
		return undefined;
	}

	return post('/file', { ...address }).then((res) => {
		if (res.ok !== 1) {
			throw new Error('Failed to remove file');
		}
		return res;
	});
}
