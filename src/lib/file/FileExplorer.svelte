<script lang="ts">
	import { onMount } from 'svelte';
	import type { FileAddress, FileCache, FileMeta } from './types';
	import { getChildAddress, read } from './distant_fs';
	import FileExplorerItem from './FileExplorerItem.svelte';

	let { address }: { address: FileAddress } = $props();

	let cache: FileCache = new Map<string, FileMeta>();
	let file: FileMeta | undefined = $state();

	onMount(async () => {
		file = cache.get(address.path);
		if (!file) {
			file = await read(address, 'directory');
			if (file) cache.set(address.path, file);
		}
	});
</script>

{#if file && (file as any).data}
	{#each (file as any).data as string[] as value}
		<FileExplorerItem {cache} address={getChildAddress(address, value)} />
	{/each}
{/if}
