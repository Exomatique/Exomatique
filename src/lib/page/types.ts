import type { IconMeta } from '$lib/types';
import type { ExoData } from '@exomatique_editor/base';

export interface PageData {
	icon?: IconMeta;
	title: string;
	content: ExoData;
}

export interface ExtraPageMetadata {}
