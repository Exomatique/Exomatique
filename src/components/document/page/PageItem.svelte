<script lang="ts">
	import { default_icon } from '$lib/document';
	import type { PageFile } from '$lib/file/types';
	import { resolvePageAddress } from '$lib/utils/link';
	import DocumentIcon from '../DocumentIcon.svelte';

	let { page: _page, href }: { page: PageFile; href?: string } = $props();
</script>

<a class="flex h-fit w-fit" {href}>
	<div
		class="border-surface-600 flex h-fit w-fit flex-row gap-2 rounded-md border-1 px-2 py-1"
		class:hover:bg-surface-100={href !== undefined}
		class:hover:cursor-pointer={href !== undefined}
	>
		<DocumentIcon icon={_page.data.icon || default_icon} size={64} />
		<div class="my-1 flex flex-col">
			<h4 class="h4 text-md">{_page.data.title}</h4>

			<div class="grow"></div>

			<h5 class="h5 text-xs text-gray-400">
				{resolvePageAddress(_page.address).path.split('.')[0]}
			</h5>
		</div>
	</div>
</a>
