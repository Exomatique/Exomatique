<script lang="ts">
	import Loading from '../../components/Loading.svelte';
	import { onMount } from 'svelte';
	import { get, lang, post } from '$lib/utils';
	import * as m from '$lib/paraglide/messages.js';
	import { Image, Network, Trash, Trees } from '@lucide/svelte';
	import { Toaster, createToaster } from '@skeletonlabs/skeleton-svelte';
	import { Popover } from '@skeletonlabs/skeleton-svelte';
	import IconX from '@lucide/svelte/icons/x';
	import { goto } from '$app/navigation';
	import { href, mapNumberToVisiblity, type DocumentMeta } from './types';
	import { user } from '../../store';
	import type { ExoData } from '@exomatique_editor/base';
	import Editor from './Editor.svelte';
	import VisibilityBadge from '../../components/document/VisibilityBadge.svelte';
	import IconPicker from '../../components/utils/IconPicker.svelte';
	import type { IconMeta } from '$lib/types';
	import DocumentIcon from '../../components/document/DocumentIcon.svelte';

	interface ComboboxData {
		label: string;
		value: string;
	}

	let tagsData: ComboboxData[] | undefined = $state(undefined);

	let tags: string[] = $state([]);
	let icon: IconMeta | undefined = $state();

	let {
		document_id,
		onFetchFail = () => {}
	}: {
		document_id: string;
		onFetchFail?: () => void;
	} = $props();

	let params_open = $state(false);
	let visibility = $state('1');
	let data: ExoData | undefined = $state(undefined);
	let tree: boolean | undefined = $state(undefined);
	let title: string | undefined = $state('');

	let isSaving = $state(false);
	let lastSaved = $state(new Date().getTime());

	let saveTimeout: NodeJS.Timeout | undefined;

	$effect(() => {
		let post_data = {
			document_id,
			url: 'index.json',
			data,
			title,
			tags,
			icon,
			tree,
			visibility: Number.parseInt(visibility)
		};
		// Use post_data to prevent editor error
		if (saveTimeout && post_data) clearTimeout(saveTimeout);
		saveTimeout = setTimeout(() => save(true), 30000);
	});

	async function save(autosave?: boolean) {
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

		await Promise.all(Object.keys(langs).map(async (v, i) => [v, (await lang(v)) || v])).then(
			(list) => list.forEach(([v, lang_value]) => ((langs as any)[v] = lang_value))
		);

		toaster.promise(
			post('/document', {
				document_id,
				data: [
					{
						url: 'index.json',
						data: JSON.stringify(data)
					}
				],
				title,
				tags,
				icon,
				tree,
				visibility: Number.parseInt(visibility)
			}).finally(() => (isSaving = false)),
			{
				loading: {
					title: langs.saving,
					description: autosave ? langs.auto_saving_description : langs.saving_description
				},
				success: () => ({
					title: langs.saved,
					description: autosave ? langs.auto_saved_description : langs.saved_description
				}),
				error: () => ({
					title: langs.save_fail,
					description: langs.save_fail_description
				})
			}
		);
	}

	let document = $state(undefined as DocumentMeta | undefined);

	onMount(() => {
		get('/document', { document_id, url: ['index.json'] })
			.then((v) => {
				if (v.authorId !== $user.id) {
					onFetchFail();
					return;
				}

				document = v;
				data = JSON.parse(v.data || '[]');
				tree = v.tree;
				title = v.title;
				tags = v.tags;
				icon = v.icon;
				visibility = String(v.visibility);
			})
			.catch(onFetchFail);

		get('/tags').then((v) => {
			tagsData = v.data as ComboboxData[];
		});
	});

	let deletePopoverState = $state(false);
	let deletionConfirmText = $state('');

	function deletePopoverClose() {
		deletionConfirmText = '';
		deletePopoverState = false;
	}

	async function deleteDocument() {
		if (deletionConfirmText !== title) return;
		await post('/document/delete', { document_id }).finally(() => goto('/documents'));
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
</script>

<Toaster {toaster}></Toaster>

<div class="relative flex h-full flex-1 flex-col items-center">
	{#if data}
		<div
			class="relative mt-5 mb-10 w-3/4 flex-row rounded-md bg-white text-neutral-950 scheme-light"
		>
			<div class="flex w-full grow justify-end gap-5 px-5 py-2">
				{#key document?.visibility}
					<button
						title={visibility === '-1'
							? m.private_description()
							: visibility === '0'
								? m.protected_description()
								: m.public_description()}
						onclick={(e) => {
							if (visibility === '-1') visibility = '1';
							else if (visibility === '1') visibility = '0';
							else visibility = '-1';
						}}
					>
						<VisibilityBadge value={mapNumberToVisiblity(Number.parseInt(visibility))} />
					</button>
				{/key}

				<input class="w-full px-2" maxlength="128" type="text" bind:value={title} />
				{#if document}
					<a
						class="btn bg-surface-200 hover:bg-surface-400 self-end"
						href={href(document)}
						class:disabled={isSaving}
						onclick={() => save()}>View</a
					>
				{/if}
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
									selected_icon={document?.icon}
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
	<div
		class="relative w-3/4 flex-row rounded-md bg-white p-2 text-neutral-950 scheme-light"
		class:mt-5={!Boolean(data)}
	>
		{#if data}
			<Editor editable bind:data />
		{:else}
			<div class="pr-2 pb-2">
				<div class="flex w-full grow justify-center shadow-2xl">
					<Loading size={'extra-large'} />
				</div>
			</div>
		{/if}
	</div>
	{#if data}
		<div class="my-5 flex w-3/4 justify-end">
			<label for="network_knowledge" class="mx-5 flex flex-nowrap items-center gap-5 text-nowrap">
				Knowledge Network <Network />
			</label>
			<input id="network_knowledge" type="checkbox" defaultchecked={tree} bind:checked={tree} />
		</div>
	{/if}
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
