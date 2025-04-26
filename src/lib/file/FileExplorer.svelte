<script lang="ts">
	import { onMount } from 'svelte';
	import type { Directory, FileAddress, FileCache, FileMeta } from './types';
	import {
		ensureDirPath,
		getChildAddress,
		getParentAddress,
		getRootAddress,
		isDirAddress,
		isFileHidden,
		read,
		write
	} from './distant_fs';
	import FileExplorerItem from './FileExplorerItem.svelte';
	import Loading from '../../components/Loading.svelte';
	import { FilePlus, FolderPlus } from '@lucide/svelte';
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import type { PageData } from '$lib/page';

	let { address }: { address: FileAddress } = $props();

	let cache: FileCache = new Map<string, FileMeta>();
	let file: FileMeta | undefined = $state();
	let selected: FileAddress | undefined = $state();

	let updater = $state(0);

	onMount(async () => {
		file = cache.get(address.path);
		if (!file) {
			file = await read(address, 'directory');
			if (file) cache.set(address.path, file);
		}
	});

	$effect(() => {
		updater;

		read(address, 'directory').then((v) => {
			file = v;
			if (v) cache.set(address.path, v);
		});
	});

	async function onNewFile(filePath: string) {
		if (!filePath.includes('.')) filePath += '.page';
		selected = selected || getRootAddress(address.document_id);
		const fileAddress = { document_id: address.document_id, path: filePath };

		if (!filePath.startsWith('/')) {
			nameError = true;
			return;
		}

		if (cache.has(fileAddress.path)) {
			nameError = true;
			return;
		}

		if (isFileHidden(fileAddress)) {
			nameError = true;
			return;
		}

		if (!cache.has(getParentAddress(fileAddress).path)) {
			nameError = true;
			return;
		}

		await write(fileAddress, 'page', {
			title: filePath,
			content: []
		} satisfies PageData).then(async (directory_data) => {
			const parent = getParentAddress(fileAddress).path;
			cache.delete(parent.substring(0, parent.length - 1));

			if (parent === '/') {
				file = await read(address, 'directory');
				if (file) cache.set(address.path, file);
			}
			selected = fileAddress;
			updater += 1;
		});

		openFileModal = false;
	}

	async function onNewFolder(folderPath: string) {
		const folderAddress = { document_id: address.document_id, path: folderPath };

		if (!isDirAddress(folderAddress)) {
			nameError = true;
			return;
		}

		await write(folderAddress, 'directory', []).then(async (directory_data) => {
			if (!directory_data) return;
			if (directory_data) {
				const parent = getParentAddress(folderAddress).path;
				cache.delete(parent.substring(0, parent.length - 1));

				if (parent === '/') {
					file = await read(address, 'directory');
					if (file) cache.set(address.path, file);
				}

				selected = folderAddress;
				updater += 1;
			}
		});

		openFolderModal = false;
	}

	let openFileModal: boolean = $state(false);
	let openFolderModal: boolean = $state(false);

	let fileNameInput: string = $state('/');

	$effect(() => {
		if (!fileNameInput.startsWith('/')) fileNameInput = '/' + fileNameInput;
	});

	let nameError: boolean = $state(false);
</script>

<div class="flex flex-col">
	<div class="bg-surface-800 flex w-full grow flex-row justify-around gap-2 rounded-t-md p-2">
		<Modal
			open={openFileModal}
			onOpenChange={(e) => {
				fileNameInput = selected?.path || '/';
				openFileModal = e.open;
				nameError = false;
			}}
			base="grow flex items-center justify-center"
			triggerBase="btn hover:border-surface-400 not-hover:border-surface-800 grow border-1"
			contentBase="bg-surface-900 rounded-md p-5"
			backdropClasses="backdrop-blur-sm"
		>
			{#snippet trigger()}
				<FilePlus />
			{/snippet}

			{#snippet content()}
				<div class="flex flex-col gap-2">
					<h3 class="text-lg font-semibold">Create File</h3>
					<input
						type="text"
						placeholder="File name"
						class="input outline-none"
						bind:value={fileNameInput}
						onfocus={(e) => {
							const length = e.currentTarget.value.length;
							const el = e.currentTarget;
							setTimeout(() => {
								el.setSelectionRange(length, length);
							});
						}}
					/>
					<h4 class="text-error-500 text-sm" class:invisible={!nameError}>
						File name is incorrect (file may already exist or file extension is invalid)
					</h4>
					<div class="flex w-full flex-row">
						<button class="btn grow bg-red-400" onclick={() => (openFileModal = false)}
							>Cancel</button
						>
						<button class="btn grow" onclick={() => onNewFile(fileNameInput)}>Create</button>
					</div>
				</div>
			{/snippet}
		</Modal>

		<Modal
			open={openFolderModal}
			onOpenChange={(e) => {
				fileNameInput = selected
					? isDirAddress(selected)
						? ensureDirPath(selected).path
						: getParentAddress(selected).path
					: '/';
				openFolderModal = e.open;
				nameError = false;
			}}
			base="grow flex items-center justify-center"
			triggerBase="btn hover:border-surface-400 not-hover:border-surface-800 grow border-1"
			contentBase="bg-surface-900 rounded-md p-5"
			backdropClasses="backdrop-blur-sm"
		>
			{#snippet trigger()}
				<FolderPlus />
			{/snippet}

			{#snippet content()}
				<div class="flex flex-col gap-2">
					<h3 class="text-lg font-semibold">Create Folder</h3>
					<input
						type="text"
						placeholder="Folder name"
						class="input outline-none"
						bind:value={fileNameInput}
						onfocus={(e) => {
							const length = e.currentTarget.value.length;
							const el = e.currentTarget;
							setTimeout(() => {
								el.setSelectionRange(length, length);
							});
						}}
					/>
					<h4 class="text-error-500 text-sm" class:invisible={!nameError}>
						Folder name is incorrect (folder may already exist or the name is invalid)
					</h4>
					<div class="flex w-full flex-row">
						<button class="btn grow bg-red-400" onclick={() => (openFileModal = false)}
							>Cancel</button
						>
						<button class="btn grow" onclick={() => onNewFolder(fileNameInput)}>Create</button>
					</div>
				</div>{/snippet}
		</Modal>
	</div>
	<div class="flex w-full grow flex-col">
		{#key file}
			{#if file && (file as any).data}
				{#each (file as any).data as string[] as value}
					<FileExplorerItem
						bind:updater
						bind:selected
						{cache}
						address={getChildAddress(address, value)}
					/>
				{/each}
			{:else}
				<div class="bg-surface-800 flex w-full grow flex-col items-center justify-center gap-2 p-5">
					<Loading size={'extra-large'} />
				</div>
			{/if}
		{/key}
	</div>
	<div class="bg-surface-800 min-h-1 rounded-b-md"></div>
</div>
