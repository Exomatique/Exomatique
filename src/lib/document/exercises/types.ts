import type { DocumentMeta } from '../types';

export interface ExerciseMeta extends DocumentMeta {
	tags: string[];
}

export function href(exercise: ExerciseMeta, edit?: boolean) {
	return '/exercises/d/' + exercise.id + (edit ? '/edit' : '');
}
