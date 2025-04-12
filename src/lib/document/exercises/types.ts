import type { DocumentMeta } from '../types';

export interface ExerciseMeta extends DocumentMeta {
	tags: string[];
}

export function href(document: DocumentMeta, edit?: boolean) {
	return '/exercises/d/' + document.id + (edit ? '/edit' : '');
}
