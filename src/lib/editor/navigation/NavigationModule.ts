import type { FileAddress } from '$lib/file/types';
import type { ExoEditor, IExoModule } from '@exomatique_editor/base';
import NavigationBlock from './NavigationBlock.svelte';
import { getChildAddress } from '$lib/file/distant_fs';

export interface NavigationData {
	href: FileAddress;
}

export default class NavigationModule implements IExoModule<NavigationData> {
	type = 'navigation';
	container = false;
	component = NavigationBlock;
	name = 'Navigation';
	icon = '<i class="fa-solid fa-n"></i>';
	default_value = (editor: ExoEditor) => ({
		href: getChildAddress(this.context(editor).root, 'index.page')
	});

	context = (editor: ExoEditor) => {
		return {
			root: editor.getContextFail('root', this) as FileAddress,
			resolver: editor.getContextFail('resolver', this) as (v: FileAddress) => string
		};
	};
}
