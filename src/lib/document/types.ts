export type DocumentVisibility = 'PUBLIC' | 'PROTECTED' | 'PRIVATE';

export interface DocumentMeta {
	id: string;
	title: string;
	author: string;
	authorId: string;
	visibility: DocumentVisibility;
}
