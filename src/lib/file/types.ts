export interface FileAddress {
	document_id: string;
	path: string;
}

export type FileType = 'json' | 'directory';
export type FileData = any | FileMeta[];

export interface FileMeta {
	readonly address: FileAddress;
	readonly type: FileType;
	readonly created: Date;
	readonly updated: Date;
}

export interface File extends FileMeta {
	readonly data: FileData;
}

export interface JsonFile<T> extends File {
	readonly type: 'json';
	readonly data: T;
}

export interface Directory extends File {
	readonly type: 'directory';
	readonly data: FileMeta[];
}
