import type { IconMeta } from '$lib/types';

export type DocumentVisibility = 'PUBLIC' | 'PROTECTED' | 'PRIVATE';

export interface DocumentMeta {
	id: string;
	url: string;
	title: string;
	author: string;
	authorId: string;
	visibility: DocumentVisibility;
	created: Date;
	updated: Date;
	icon: IconMeta;
	tree: boolean;
	tags: string[];
}

export const default_icon: IconMeta = {
	library: 'lucide',
	value: 'Image',
	numbering: 10
};

export function href(document: DocumentMeta, edit?: boolean) {
	return '/documents/d/' + document.id + (edit ? '/edit/' : '/') + document.url;
}

export function hrefTree(document: DocumentMeta, edit?: boolean) {
	return '/documents/tree/' + document.id + (edit ? '/edit' : '');
}

export function mapVisibilityToNumber(visibility: DocumentVisibility) {
	switch (visibility) {
		case 'PUBLIC':
			return 1;
		case 'PROTECTED':
			return 0;
		default:
			return -1;
	}
}

export function mapNumberToVisiblity(visibility: number): DocumentVisibility {
	if (visibility === 1) {
		return 'PUBLIC';
	} else if (visibility === 0) {
		return 'PROTECTED';
	} else {
		return 'PRIVATE';
	}
}
