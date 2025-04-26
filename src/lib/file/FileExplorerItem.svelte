<script lang="ts">
	import { onMount } from 'svelte';
	import type { Directory, FileAddress, FileCache, FileMeta } from './types';
	import {
		ensureDirPath,
		getChildAddress,
		getFileName,
		getMeta,
		getParentAddress,
		getRootAddress,
		isDirAddress,
		read,
		remove
	} from './distant_fs';
	import {
		ArrowDown,
		ArrowRight,
		ChevronDown,
		ChevronRight,
		CornerDownRight,
		File,
		Folder,
		Trash
	} from '@lucide/svelte';
	import Loading from '../../components/Loading.svelte';
	import { href } from '$lib/page/links';

	import FileExplorerItem from './FileExplorerItem.svelte';
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { simplifyPageAddress } from '$lib/utils/link';

	let {
		address,
		cache,
		selected = $bindable(),
		updater = $bindable(0)
	}: {
		address: FileAddress;
		updater: number;
		cache: FileCache;
		selected: FileAddress | undefined;
	} = $props();

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

	$effect(() => {
		if (
			selected &&
			(selected.path + '/').startsWith(address.path + '/') &&
			selected.path !== address.path
		) {
			collaspsed = false;
		}
	});

	let deleteModal = $state(false);
	let deleteNonEmptyFolder = $state(false);

	async function onDelete() {
		if (selected && (selected.path + '/').startsWith(address.path + '/')) {
			selected = getRootAddress(address.document_id);
		}

		await remove(isDirAddress(address) ? ensureDirPath(address) : address);
		cache.delete(address.path);
		cache.delete(getParentAddress(address).path);

		if (!isDirAddress(address) && page.url.pathname.endsWith(simplifyPageAddress(address).path)) {
			goto(href(getRootAddress(address.document_id), page.url.pathname.includes('/edit')));
		}

		selected = selected;
		deleteModal = false;
		updater += 1;
	}
</script>

<div
	role="none"
	class="relative flex flex-row items-center gap-2 px-2 py-2"
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
	{:else if selected?.path === address.path && address.path !== '/index.page'}
		<Modal
			open={deleteModal}
			onOpenChange={(e) => (deleteModal = e.open)}
			base="btn btn-icon absolute right-2 cursor-pointer border-1 border-red-300 text-red-400"
			triggerBase="btn hover:border-surface-400 not-hover:border-surface-800 grow border-1"
			contentBase="bg-surface-900 rounded-md p-5"
			backdropClasses="backdrop-blur-sm"
		>
			{#snippet trigger()}
				<Trash />
			{/snippet}

			{#snippet content()}
				<div>
					<div class="flex flex-col gap-2">
						<h3 class="text-lg font-semibold">Delete file</h3>
						{#if (file?.type === 'directory' && children?.length) || 0 > 0}
							<div class="">
								Warning : you're going to delete a non empty folder
								<input
									type="checkbox"
									class="input inline outline-none"
									bind:checked={deleteNonEmptyFolder}
								/>
							</div>
						{/if}
						<div class="flex w-full flex-row">
							<button class="btn grow" onclick={() => (deleteModal = false)}>Cancel</button>
							<button
								class="btn grow bg-red-400"
								onclick={() => onDelete()}
								disabled={file?.type === 'directory' &&
									(children?.length || 0) > 0 &&
									!deleteNonEmptyFolder}>Confirm</button
							>
						</div>
					</div>
				</div>
			{/snippet}
		</Modal>
	{/if}
</div>

{#if file?.type === 'directory' && children && !collaspsed}
	<div class="relative ml-8">
		{#each children as child}
			<FileExplorerItem
				bind:selected
				bind:updater
				{cache}
				address={getChildAddress(address, child)}
			/>
		{/each}
	</div>
{/if}
