export type DocumentVisibility = 'PUBLIC' | 'PROTECTED' | 'PRIVATE';

export interface DocumentMeta {
	id: string;
	title: string;
	author: string;
	authorId: string;
	visibility: DocumentVisibility;
}

export function mapVisibilityToNumber(visibility: DocumentVisibility) {
	switch (visibility) {
		case 'PUBLIC':
			1;
		case 'PROTECTED':
			0;
		case 'PRIVATE':
			-1;
	}
}

export function mapNumberToVisiblity(visibility: number) {
	if (visibility === 1) {
		return 'PUBLIC';
	} else if (visibility === 0) {
		return 'PROTECTED';
	} else {
		return 'PRIVATE';
	}
}
