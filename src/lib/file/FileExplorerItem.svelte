<script lang="ts">
	import { onMount } from 'svelte';
	import type { FileAddress, FileCache, FileMeta } from './types';
	import { getFileName, getMeta } from './distant_fs';
	import { File, Folder } from '@lucide/svelte';
	import Loading from '../../components/Loading.svelte';
	import { href } from '$lib/page/links';

	let { address, cache }: { address: FileAddress; cache: FileCache } = $props();

	let file: FileMeta | undefined = $state();
	let name: string | undefined = $state();

	onMount(async () => {
		file = cache.get(address);
		if (!file) {
			file = await getMeta(address);
		}

		name = await getFileName(address);
	});
</script>

<div class="bg-surface-800 flex flex-row items-center gap-2 px-2 py-1">
	{#if file?.type === 'directory'}
		<Folder size={16} />
	{:else if file?.type !== undefined}
		<File size={16} />
	{:else}
		<Loading size={'small'} />
	{/if}

	<a href={href(address, true)}>{name}</a>

	<div class="grow"></div>
</div>
