<script lang="ts">
	import { onMount } from 'svelte';
	import type { Directory, File, FileAddress, FileCache, FileMeta } from './types';
	import {
		ensureDirPath,
		getChildAddress,
		getFileName,
		getParentAddress,
		getRootAddress,
		isDirAddress,
		isFileHidden,
		read,
		remove,
		write
	} from './distant_fs';
	import FileExplorerItem from './FileExplorerItem.svelte';
	import Loading from '../../components/Loading.svelte';
	import { ArrowDownUp, FilePlus, FolderPlus } from '@lucide/svelte';
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import type { ExtraPageMetadata, PageData } from '$lib/page';
	import { resolvePageAddress, simplifyPageAddress } from '$lib/utils/link';
	import { SvelteMap } from 'svelte/reactivity';

	let { address }: { address: FileAddress } = $props();

	let cache: FileCache = new Map<string, FileMeta>();
	let collapsing_map = new SvelteMap<string, boolean>();
	let file: FileMeta | undefined = $state();
	let selected: FileAddress | undefined = $state();

	let updater = $state(0);

	onMount(async () => {
		file = cache.get(address.path);
		await refresh();
	});

	function refresh() {
		return read(address, 'directory').then((value) => {
			if (JSON.stringify(value) === JSON.stringify(file)) return;
			file = value;
			if (value) cache.set(address.path, value);
		});
	}

	$effect(() => {
		updater;

		refresh();
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
			await write(getParentAddress(fileAddress), 'directory', [getFileName(fileAddress)]);
		}

		await write(fileAddress, 'page', {
			title: filePath,
			content: []
		} satisfies PageData).then(async (directory_data) => {
			const parent = getParentAddress(fileAddress).path;
			cache.delete(parent.substring(0, parent.length - 1));

			if (parent === '/') {
				await refresh();
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
					await refresh();
				}

				selected = folderAddress;
				updater += 1;
			}
		});

		openFolderModal = false;
	}

	let openFileModal: boolean = $state(false);
	let openFolderModal: boolean = $state(false);
	let openMoveModal: boolean = $state(false);

	async function onMoveFile(originPath: string, targetPath: string) {
		let originAddress = { document_id: address.document_id, path: originPath };
		let targetAddress = { document_id: address.document_id, path: targetPath };

		const fileMeta = cache.get(originAddress.path);
		if (!fileMeta) {
			nameError = true;
			return;
		}

		if (fileMeta.type === 'directory') {
			originAddress = ensureDirPath(originAddress);
			targetAddress = ensureDirPath(targetAddress);
		} else {
			originAddress = resolvePageAddress(originAddress);
			targetAddress = resolvePageAddress(targetAddress);
		}

		if (originAddress.path === targetAddress.path) {
			openMoveModal = false;
			return;
		}

		if (
			!cache.has(originAddress.path) ||
			(cache.has(targetAddress.path) && targetAddress.path !== '/index.page')
		) {
			nameError = true;
			return;
		}

		if (!cache.has(getParentAddress(targetAddress).path)) {
			await write(getParentAddress(targetAddress), 'directory', [getFileName(targetAddress)]);
		}

		const originFile = await read(originAddress, fileMeta.type).then((v) => v as File);

		await write(targetAddress, fileMeta.type, originFile.data).then(async () => {
			cache.delete(originAddress.path);
			cache.delete(targetAddress.path);
			if (originAddress.path !== '/index.page') await remove(originAddress);
			else {
				await write(originAddress, 'page', {
					title: 'Default Title',
					content: []
				} satisfies PageData);
			}

			const parent = getParentAddress(originAddress).path;
			cache.delete(parent.substring(0, parent.length - 1));
			const target_parent = getParentAddress(targetAddress).path;
			cache.delete(target_parent.substring(0, target_parent.length - 1));

			if (parent === '/' || target_parent === '/') {
				await refresh();
			}

			selected = { document_id: address.document_id, path: targetPath };
			updater += 1;
		});

		openMoveModal = false;
	}

	let fileNameInput: string = $state('/');
	let targetNameInput: string = $state('/');
	let overrideIndex: boolean = $state(false);

	$effect(() => {
		if (!fileNameInput.startsWith('/')) fileNameInput = '/' + fileNameInput;
		if (!targetNameInput.startsWith('/')) targetNameInput = '/' + targetNameInput;
	});

	let nameError: boolean = $state(false);
</script>

<div class="flex flex-col">
	<div class="bg-surface-800 flex w-full grow flex-row justify-around gap-2 rounded-t-md p-2">
		<Modal
			open={openFileModal}
			onOpenChange={(e) => {
				fileNameInput = simplifyPageAddress(selected || getRootAddress(address.document_id)).path;
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

		<Modal
			open={openMoveModal}
			onOpenChange={(e) => {
				fileNameInput = simplifyPageAddress(selected || getRootAddress(address.document_id)).path;
				openMoveModal = e.open;
				nameError = false;
				overrideIndex = false;
			}}
			base="grow flex items-center justify-center"
			triggerBase="btn hover:border-surface-400 not-hover:border-surface-800 grow border-1"
			contentBase="bg-surface-900 rounded-md p-5"
			backdropClasses="backdrop-blur-sm"
		>
			{#snippet trigger()}
				<ArrowDownUp />
			{/snippet}

			{#snippet content()}
				<div class="flex flex-col gap-2">
					<h3 class="text-lg font-semibold">Move File</h3>
					<input
						type="text"
						placeholder="Origin"
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

					<input
						type="text"
						placeholder="Target"
						class="input outline-none"
						bind:value={targetNameInput}
						onfocus={(e) => {
							const length = e.currentTarget.value.length;
							const el = e.currentTarget;
							setTimeout(() => {
								el.setSelectionRange(length, length);
							});
						}}
					/>
					<h4 class="text-error-500 text-sm" class:invisible={!nameError}>
						Paths are invalid or origin does not exist
					</h4>
					<div
						class:invisible={resolvePageAddress({ ...address, path: targetNameInput }).path !==
							'/index.page'}
					>
						<h4>Warning : By doing so you'll lose data in index.page</h4>
						<input type="checkbox" class="input outline-none" bind:checked={overrideIndex} />
					</div>

					<div class="flex w-full flex-row">
						<button class="btn grow bg-red-400" onclick={() => (openMoveModal = false)}
							>Cancel</button
						>
						<button
							class="btn grow"
							onclick={() => onMoveFile(fileNameInput, targetNameInput)}
							disabled={resolvePageAddress({ ...address, path: targetNameInput }).path ===
								'/index.page' && !overrideIndex}>Move</button
						>
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
						{collapsing_map}
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
