import type { DocumentMeta } from '../types';

export interface ExerciseMeta extends DocumentMeta {
	tags: string[];
}

export function href(exercise: ExerciseMeta) {
	return '/exercises/d/' + exercise.id;
}
