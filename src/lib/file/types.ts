import type { DocumentMeta } from '$lib/document';
import type { ExtraPageMetadata, PageData } from '$lib/page';

export interface FileAddress {
	document_id: string;
	path: string;
}

export type FileType = 'json' | 'directory' | 'page';
export type FileData = any | DocumentMeta | FileMeta[];

export interface FileMeta {
	readonly address: FileAddress;
	readonly type: FileType;
	readonly created: Date;
	readonly updated: Date;
	readonly extra?: any;
}

export interface File extends FileMeta {
	readonly data: FileData;
}

export interface PageFile extends File {
	readonly type: 'page';
	readonly data: PageData;
	readonly extra: ExtraPageMetadata;
}

export interface JsonFile<T> extends File {
	readonly type: 'json';
	readonly data: T;
}

export interface Directory extends File {
	readonly type: 'directory';
	readonly data: string[];
}

export type FileCache = Map<string, FileMeta | File>;

export function isFileMeta(file: FileMeta | File): file is FileMeta {
	return 'address' in file && 'type' in file && 'created' in file && 'updated' in file;
}

export function isFilePage(file: File): file is PageFile {
	return file.type === 'page' && isFileMeta(file);
}

export function isFileDataPage(data: FileData): data is PageData {
	return data && typeof data === 'object' && 'content' in data && 'title' in data;
}

export function isFileJson<T>(file: File): file is JsonFile<T> {
	return file.type === 'json' && isFileMeta(file);
}

export function isFileDataJson<T>(data: FileData): data is any {
	return true;
}

export function isFileDirectory(file: File): file is Directory {
	return file.type === 'directory' && isFileMeta(file);
}

export function isFileDataDirectory(data: FileData): data is string[] {
	return Array.isArray(data) && data.every((item) => typeof item === 'string');
}

export function doesFileDataTypeMatchType(type: FileType, data: FileData) {
	return type === 'json'
		? isFileDataJson(data)
		: type === 'directory'
			? isFileDataDirectory(data)
			: type === 'page'
				? isFileDataPage(data)
				: false;
}
