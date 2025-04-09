import DocumentTypeManager, { type ComponentProps } from '../DocumentTypeManager';
import Exercise from './Exercise.svelte';

export default class ExerciseManager extends DocumentTypeManager {
	getComponent(): [any, ComponentProps] {
		return [Exercise, { url: 'index.json', document_id: undefined }];
	}
	constructor() {
		super('exercise');
	}
}
