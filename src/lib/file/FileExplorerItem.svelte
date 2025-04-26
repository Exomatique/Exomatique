<script lang="ts">
	import { onMount } from 'svelte';
	import type { Directory, FileAddress, FileCache, FileMeta } from './types';
	import { getChildAddress, getFileName, getMeta, isDirAddress, read } from './distant_fs';
	import {
		ArrowDown,
		ArrowRight,
		ChevronDown,
		ChevronRight,
		CornerDownRight,
		File,
		Folder
	} from '@lucide/svelte';
	import Loading from '../../components/Loading.svelte';
	import { href } from '$lib/page/links';

	import FileExplorerItem from './FileExplorerItem.svelte';

	let {
		address,
		cache,
		selected = $bindable()
	}: { address: FileAddress; cache: FileCache; selected: FileAddress | undefined } = $props();

	let file: FileMeta | undefined = $state();
	let name: string = getFileName(address);
	let children: string[] | undefined = $state();
	let collaspsed: boolean = $state(true);

	onMount(async () => {
		file = cache.get(address.path);
		if (!file) {
			file = await (isDirAddress(address) ? read(address, 'directory') : getMeta(address));
			if (file) cache.set(address.path, file);
		}
		children = file?.type === 'directory' ? (file as Directory).data : undefined;
	});
</script>

<div
	role="none"
	class="flex flex-row items-center gap-2 px-2 py-1"
	class:bg-surface-700={selected?.path === address.path}
	class:bg-surface-800={selected?.path !== address.path}
	onclick={() => (selected = address)}
>
	{#if isDirAddress(address)}
		{#if collaspsed}
			<ChevronRight size={16} />
		{:else}
			<ChevronDown size={16} />
		{/if}
	{:else}
		<File size={16} />
	{/if}

	{#if isDirAddress(address)}
		<button onclick={() => (collaspsed = !collaspsed)} disabled={file?.type === undefined}
			>{name}</button
		>
	{:else if file?.type === undefined}
		<p class="opacity-60">{name}</p>
	{:else}
		<a href={href(address, true)}>{name}</a>
	{/if}

	<div class="grow"></div>

	{#if file?.type === undefined}
		<Loading size={'small'} />
	{/if}
</div>

{#if file?.type === 'directory' && children && !collaspsed}
	<div class="relative ml-8">
		{#each children as child}
			<FileExplorerItem bind:selected {cache} address={getChildAddress(address, child)} />
		{/each}
	</div>
{/if}
