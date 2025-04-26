<script lang="ts">
	import { onMount } from 'svelte';
	import type { FileAddress, FileCache, FileMeta } from './types';
	import FileExplorerDirectory from './FileExplorerDirectory.svelte';

	let { address }: { address: FileAddress } = $props();

	let cache: FileCache = new Map<FileAddress, FileMeta>();

	onMount(() => {});
</script>

<FileExplorerDirectory {cache} {address} folded={false} />
