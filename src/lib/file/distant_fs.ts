import { get, post } from '$lib/utils';
import type { File, FileAddress, FileData, FileMeta, FileType } from './types';

export function getRootAddress(document_id: string): FileAddress {
	return {
		document_id,
		path: ''
	};
}

export function getChildAddress(address: FileAddress, child: string): FileAddress {
	if (address.path === '') {
		return { ...address, path: child };
	}
	return { ...address, path: `${address.path}/${child}` };
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

export async function getFileName(address: FileAddress): Promise<string> {
	if (!address.path.includes('/')) {
		return address.path;
	}

	return address.path.substring(address.path.lastIndexOf('/') + 1);
}

export async function getMeta(address: FileAddress): Promise<FileMeta | undefined> {
	if (isFileHidden(address)) {
		return undefined;
	}

	return get('/file/meta', { ...address }).then((res) => {
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

	return post('/file/meta', { ...address, meta }).then((res) => {
		if (res.ok !== 1) {
			throw new Error('Failed to set file meta');
		}
		return res.meta;
	});
}

export async function read(address: FileAddress): Promise<File | undefined> {
	if (isFileHidden(address)) {
		return undefined;
	}

	return get('/file', { ...address }).then((res) => {
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

	return post('/file', { ...address, type, data }).then((res) => {
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
