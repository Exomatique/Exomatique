<script lang="ts">
	import Loading from '../../components/Loading.svelte';
	import { onMount } from 'svelte';
	import { get, lang, post } from '$lib/utils';
	import * as m from '$lib/paraglide/messages.js';
	import { Image, Network, Trash, Trees } from '@lucide/svelte';
	import { Toaster, createToaster } from '@skeletonlabs/skeleton-svelte';
	import { Popover } from '@skeletonlabs/skeleton-svelte';
	import IconX from '@lucide/svelte/icons/x';
	import { afterNavigate, beforeNavigate, goto } from '$app/navigation';
	import { mapNumberToVisiblity, type DocumentMeta } from './types';
	import { user } from '../../store';
	import type { ExoData } from '@exomatique_editor/base';
	import Editor from './Editor.svelte';
	import VisibilityBadge from '../../components/document/VisibilityBadge.svelte';
	import IconPicker from '../../components/utils/IconPicker.svelte';
	import type { IconMeta } from '$lib/types';
	import DocumentIcon from '../../components/document/DocumentIcon.svelte';
	import FileExplorer from '$lib/file/FileExplorer.svelte';
	import { getChildAddress, getFileName, getRootAddress, read, write } from '$lib/file/distant_fs';
	import type { FileAddress, PageFile } from '$lib/file/types';
	import type { PageData } from '$lib/page';
	import { href } from '$lib/page/links';
	import { resolvePageAddress } from '$lib/utils/link';
	import NavigationModule from '$lib/editor/navigation/NavigationModule';

	interface ComboboxData {
		label: string;
		value: string;
	}

	let tagsData: ComboboxData[] | undefined = $state(undefined);

	let tags: string[] = $state([]);
	let icon: IconMeta | undefined = $state();

	let {
		address = $bindable(),
		onFetchFail = () => {}
	}: {
		address: FileAddress;
		onFetchFail?: () => void;
	} = $props();

	let real_address = $derived.by(() => resolvePageAddress(address));

	let visibility = $state('1');
	let data: ExoData | undefined = $state(undefined);
	let title: string | undefined = $state('');

	let isSaving = $state(false);
	let lastSaved = $state(new Date().getTime());

	let saveTimeout: NodeJS.Timeout | undefined;

	let lastSavedRaw = JSON.stringify({});
	$effect(() => {
		let post_data = {
			real_address,
			data,
			title,
			tags,
			icon,
			visibility: Number.parseInt(visibility)
		};

		// Use post_data to prevent editor error
		post_data;
		resetSaveTimeout();
	});

	function resetSaveTimeout() {
		if (saveTimeout) clearTimeout(saveTimeout);
		if (_document != null)
			saveTimeout = setTimeout(() => {
				// save(true);
			}, 5000);
	}

	async function save(autosave?: boolean) {
		const toBeSaved: Partial<DocumentMeta> = {
			..._document,
			...real_address,
			title,
			tags,
			icon,
			visibility: mapNumberToVisiblity(Number.parseInt(visibility))
		};

		const trimmedToBeSaved = {
			...toBeSaved,
			updated: undefined,
			data: JSON.stringify(data)
		};

		if (JSON.stringify(trimmedToBeSaved) === lastSavedRaw) return;
		lastSavedRaw = JSON.stringify(trimmedToBeSaved);

		lastSaved = new Date().getTime();
		isSaving = true;

		const langs = {
			save_fail: undefined,
			saved: undefined,
			saving: undefined,
			saving_description: undefined,
			saved_description: undefined,
			save_fail_description: undefined,
			auto_saving_description: undefined,
			auto_saved_description: undefined
		};

		await Promise.all(Object.keys(langs).map(async (v) => [v, (await lang(v)) || v])).then((list) =>
			list.forEach(([v, lang_value]) => ((langs as any)[v] = lang_value))
		);

		toaster.promise(
			write(real_address, 'page', {
				title: _page?.data.title || '',
				content: data || []
			} satisfies PageData).finally(() => (isSaving = false)),
			{
				loading: {
					title: langs.saving,
					description: autosave ? langs.auto_saving_description : langs.saving_description
				},
				success: () => ({
					title: langs.saved,
					description: autosave ? langs.auto_saved_description : langs.saved_description
				}),
				error: (e) => {
					console.error(e);
					return {
						title: langs.save_fail,
						description: langs.save_fail_description
					};
				}
			}
		);
	}

	let _document = $state(undefined as DocumentMeta | undefined);
	let _page = $state(undefined as PageFile | undefined);

	function loadPage() {
		data = undefined;

		if (_document?.id !== real_address.document_id) {
			get('/document', { document_id: real_address.document_id })
				.then((v) => {
					const document_meta = v.meta as DocumentMeta;

					_document = document_meta;
					title = document_meta.title;
					tags = document_meta.tags;
					icon = document_meta.icon;
					visibility = document_meta.visibility;
				})
				.catch((e) => {
					console.error(e);
					onFetchFail();
				});

			get('/tags').then((v) => {
				tagsData = v.data as ComboboxData[];
			});
		}

		read(real_address, 'page')
			.then((unsafe_file) => {
				if (!unsafe_file) throw new Error('File not found');
				if (!(unsafe_file as any satisfies PageFile)) throw new Error('File is not a page');

				const file = unsafe_file as PageFile;
				_page = file;

				const trimmedToBeSaved = {
					...file,
					updated: undefined,
					data: JSON.stringify(file.data)
				};
				lastSavedRaw = JSON.stringify(trimmedToBeSaved);

				data = file.data.content;

				resetSaveTimeout();
			})
			.catch((e) => {
				console.error(e);

				onFetchFail();
			});
	}

	onMount(() => {
		loadPage();
	});

	$effect(() => {
		real_address;
		loadPage();
	});

	let deletePopoverState = $state(false);
	let deletionConfirmText = $state('');

	function deletePopoverClose() {
		deletionConfirmText = '';
		deletePopoverState = false;
	}

	async function deleteDocument() {
		if (deletionConfirmText !== title) return;
		await post('/document/delete', real_address).finally(() => goto('/documents'));
	}

	const toaster = createToaster({ placement: 'bottom-end' });

	let tagContainer: HTMLElement | undefined = $state(undefined);
	let tag_select = $state(0);
	let filterTag = $state('');

	let filtered = $derived(
		((tagsData as any as ComboboxData[]) || [])
			.filter((v) => v.label.toLocaleLowerCase().startsWith(filterTag.toLowerCase()))
			.filter((v) => !tags.includes(v.value))
	);

	function onChoice(choice_index: number) {
		tags.push(filtered[choice_index].value);
	}

	let iconPopover = $state(false);

	let root = $derived(getRootAddress(address.document_id));

	afterNavigate(() => {
		let v = document.getElementById('pane');
		if (!v) return;
		v.scrollIntoView({
			block: 'end',
			behavior: 'instant'
		});
	});
</script>

<Toaster {toaster}></Toaster>

<div id="document_pane" class="relative flex h-full flex-1 flex-col items-center">
	{#if _document !== undefined}
		<div
			class="relative mt-5 mb-10 w-3/4 flex-row rounded-md bg-white text-neutral-950 scheme-light"
		>
			<div class="flex w-full grow justify-end gap-5 px-5 py-2">
				{#key _document?.visibility}
					<button
						title={visibility === '-1'
							? m.private_description()
							: visibility === '0'
								? m.protected_description()
								: m.public_description()}
						onclick={() => {
							if (visibility === '-1') visibility = '1';
							else if (visibility === '1') visibility = '0';
							else visibility = '-1';
						}}
					>
						<VisibilityBadge value={mapNumberToVisiblity(Number.parseInt(visibility))} />
					</button>
				{/key}

				<input class="w-full px-2" maxlength="128" type="text" bind:value={title} />
				<a
					class="btn bg-surface-200 hover:bg-surface-400 self-end"
					href={href(address)}
					class:disabled={isSaving}
					onclick={() => save()}>View</a
				>
				<button
					class="btn bg-surface-200 hover:bg-surface-400 self-end"
					class:disabled={isSaving}
					onclick={() => save()}>Save</button
				>

				<button
					class="btn right-5 bottom-5 border-2 border-red-400 shadow-sm shadow-red-400"
					onclick={() => (deletePopoverState = true)}
				>
					<Trash color="red" />
				</button>
			</div>
			<div class="flex flex-row py-5">
				<div class="h-fil mx-5 w-fit">
					<Popover open={iconPopover}>
						{#snippet trigger()}
							<button onclick={() => (iconPopover = true)}>
								<DocumentIcon
									icon={icon || {
										library: 'lucide',
										value: 'Image'
									}}
									backgroundColor="white"
									size={96}
								/>
							</button>
						{/snippet}

						{#snippet content()}
							<article class="flex justify-between">
								<IconPicker
									onSubmit={(v) => {
										icon = v;
										iconPopover = false;
									}}
									onQuit={() => (iconPopover = false)}
									selected_icon={_document?.icon}
								/>
							</article>
						{/snippet}
					</Popover>
				</div>
				<div class="flex w-full grow flex-wrap justify-start gap-1 px-5 py-2">
					{#each (tagsData || []).filter((v) => tags.includes(v.value)) as tag}
						<button
							class="button btn-base chip preset-filled h-fit"
							onclick={() => {
								tags = tags.filter((v) => tag.value !== v);
							}}>{tag.label} x</button
						>
					{/each}

					<Popover
						positioning={{ placement: 'top' }}
						triggerBase="hover:bg-surface-100 ignore-focus px-2 rounded-lg btn-base"
						contentBase="scheme-light text-neutral-950 flex flex-col relative rounded-lg border-2 border-surface-300 bg-surface-50 p-2"
						arrow
						arrowBackground="!bg-surface-200 dark:!bg-surface-800"
					>
						{#snippet trigger()}
							<i class="fa-solid fa-plus"></i>
						{/snippet}

						{#snippet content()}
							<div
								role="none"
								class="bg-surface-100 m-2 flex flex-row items-center rounded-lg p-1"
								onkeydown={(e) => {
									if (e.key === 'ArrowUp') {
										tag_select = Math.max(tag_select - 1, 0);
										tagContainer?.children[tag_select].scrollIntoView(false);
									} else if (e.key === 'ArrowDown') {
										tag_select = Math.min(tag_select + 1, filtered.length - 1);
										tagContainer?.children[tag_select].scrollIntoView(false);
									} else if (e.key === 'Enter' || e.key === 'Space') {
										onChoice(tag_select);
									}
								}}
							>
								<i class="fa-solid fa-magnifying-glass mx-2"></i>
								<input
									class="bg-surface-100 outline-none"
									bind:value={filterTag}
									onchange={() => (tag_select = -1)}
								/>
							</div>

							<div
								bind:this={tagContainer}
								class="ignore-focus flex max-h-40 flex-1 flex-col overflow-scroll"
							>
								{#each filtered.map( (v, i) => ({ index: i, value: v.label }) ) as { index, value: k }}
									<button
										class="hover:bg-surface-100 m-1 flex flex-1 flex-row items-center gap-5 rounded-lg px-4"
										class:bg-surface-100={tag_select === index}
										onclick={() => {
											onChoice(index);
										}}
										onmouseenter={() => {
											tag_select = index;
										}}
										onmouseleave={() => {
											tag_select = -1;
										}}
									>
										{k}
									</button>
								{/each}
							</div>
						{/snippet}
					</Popover>
				</div>
			</div>
		</div>
	{/if}

	<div id="pane" class="relative flex min-h-dvh w-full grow flex-row">
		<div class="w-1/4 rounded-md p-2">
			<FileExplorer address={root} />
		</div>
		<div class="bg-surface-900 w-2 p-1"></div>
		<div
			id="editor_pane"
			class="m-2 max-h-dvh w-3/4 overflow-scroll rounded-md bg-white p-2 py-4 text-neutral-950 scheme-light"
		>
			{#if data !== undefined && _page !== undefined}
				<input
					type="text"
					bind:value={_page.data.title}
					class="h4 mx-5 my-1 px-1 py-2 outline-none"
				/>
				<Editor
					editable
					bind:data
					extra_modules={[new NavigationModule()]}
					provideContext={(editor) => {
						editor.addContext(
							'root',
							getRootAddress(address.document_id),
							editor.modules['navigation']
						);

						editor.addContext('resolver', (v: FileAddress) => href(v, true));
					}}
				/>
			{:else}
				<div class="flex h-full w-full justify-center">
					<Loading size={'extra-large'} />
				</div>
			{/if}
		</div>
	</div>
</div>

{#if deletePopoverState}
	<div
		class="bg-surface-950 absolute top-0 left-0 flex h-full w-full flex-1 items-center justify-center opacity-90"
	>
		<Popover
			open={deletePopoverState}
			modal
			onOpenChange={(e) => (deletePopoverState = e.open)}
			positioning={{ placement: 'top' }}
			contentBase="card bg-surface-200-800 border-2 border-red-400 p-4 space-y-4"
			arrow
			arrowBackground=""
		>
			{#snippet trigger()}{/snippet}
			{#snippet content()}
				<header class="flex justify-between">
					<p class="text-xl font-bold">{m.document_confirm_delete()}</p>
					<button class="btn-icon hover:preset-tonal" onclick={deletePopoverClose}><IconX /></button
					>
				</header>
				<article>
					<p class="text-red-400">
						{m.document_confirm_delete_text_0()}
					</p>
					<p>
						{m.document_confirm_delete_text_1()}
					</p>

					<div class="mt-2 flex flex-row items-center gap-5">
						<input
							class="input bg-surface-950 text-red-500 outline-none selection:outline-none placeholder:text-red-400 placeholder:opacity-50"
							placeholder={title}
							bind:value={deletionConfirmText}
						/>

						<button
							class="btn m-2 border-2 border-red-600"
							disabled={deletionConfirmText !== title}
							onclick={deleteDocument}
						>
							<Trash color="red" />
						</button>
					</div>
					<p class={`${deletionConfirmText === title ? 'invisible' : ''} opacity-70`}>
						{m.document_confirm_fail({ title: title || '' })}
					</p>
				</article>
			{/snippet}
		</Popover>
	</div>
{/if}

<style>
	:global(.ig-input) {
		outline-style: none;
	}
</style>
