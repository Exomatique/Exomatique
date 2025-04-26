<script lang="ts">
	import { onMount } from 'svelte';
	import type { FileAddress, FileCache, FileMeta } from './types';
	import { getChildAddress, read } from './distant_fs';
	import FileExplorerItem from './FileExplorerItem.svelte';

	let {
		address,
		cache,
		folded = $bindable(false)
	}: { address: FileAddress; cache: FileCache; folded?: boolean } = $props();

	let file: FileMeta | undefined = $state();

	onMount(async () => {
		file = cache.get(address);
		if (!file) {
			file = await read(address, 'directory');
			if (file) cache.set(address, file);
		}
	});
</script>

<div class="ml-5">
	{#if file && (file as any).data && !folded}
		{#each (file as any).data as string[] as value}
			<FileExplorerItem {cache} address={getChildAddress(address, value)} />
		{/each}
	{/if}
</div>
