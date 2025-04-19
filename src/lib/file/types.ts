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

export type FileCache = Map<FileAddress, FileMeta | File>;
