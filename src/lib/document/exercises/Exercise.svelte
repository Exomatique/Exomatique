<script lang="ts">
	import type { ExoData } from '@exomatique/editor';
	import {
		DefinitionModule,
		Editor,
		ExoEditor,
		LatexModule,
		MdModule,
		TheoremModule,
		VideoModule
	} from '@exomatique/editor';
	import Loading from '../../../components/Loading.svelte';
	import { onMount } from 'svelte';
	import { get, post } from '$lib/utils';
	import * as m from '$lib/paraglide/messages.js';
	import Combobox from '../../../components/utils/Combobox.svelte';

	interface ComboboxData {
		label: string;
		value: string;
	}

	let tagsData: ComboboxData[] | undefined = $state(undefined);

	let tags = $state([]);

	let {
		document_id
	}: {
		document_id: string;
	} = $props();

	const exo_editor = new ExoEditor({
		modules: [
			new MdModule(),
			new DefinitionModule(),
			new TheoremModule(),
			new LatexModule(),
			new VideoModule()
		],
		default_module: 'md'
	});

	let params_open = $state(false);
	let visibility = $state('1');
	let data: ExoData | undefined = $state(undefined);
	let title: string | undefined = $state('');

	let isSaving = $state(false);
	let lastSaved = $state(new Date().getTime());

	async function save() {
		lastSaved = new Date().getTime();
		isSaving = true;
		post('/exercise', {
			document_id,
			url: 'index.json',
			data,
			title,
			tags,
			visibility: Number.parseInt(visibility)
		}).finally(() => (isSaving = false));
	}

	onMount(() => {
		get('/exercise', { document_id, url: 'index.json' })
			.then((v) => {
				data = v.data;
				title = v.title;
				tags = v.tags;
				visibility = String(v.visibility);
			})
			.catch(console.error);

		get('/tags').then((v) => {
			tagsData = v.data as ComboboxData[];
		});
	});
</script>

<div class="relative flex h-full flex-1 justify-center">
	<div class="absolute w-3/4 grow flex-row bg-white text-neutral-950 scheme-light">
		{#if data}
			<div class="flex w-full grow justify-end px-5 py-2">
				<input class="mx-5 w-full px-2" maxlength="128" type="text" bind:value={title} />
				<button class="btn bg-surface-200 hover:bg-surface-400 self-end" onclick={save}>Save</button
				>
			</div>
			<Editor {exo_editor} bind:data />
		{:else}
			<div class=" pr-2 pb-2">
				<div class="flex w-full grow justify-center shadow-2xl">
					<Loading size={'extra-large'} />
				</div>
			</div>
		{/if}
	</div>
</div>

<div
	class={'bg-surface-800 absolute top-0 left-0 flex h-full flex-row ' +
		(params_open ? 'w-1/3' : '')}
>
	{#if params_open}
		<div class="flex grow flex-col items-center">
			<h2 class="h2 mb-2">{m.exercises_settings()}</h2>
			<label class="label m-2 flex items-center justify-center gap-5 text-nowrap">
				<span class="text-nowrap">{m.visibility()} :</span>
				<select class="select m-2 max-w-3xs p-1 px-2" bind:value={visibility}>
					<option selected={visibility === '1'} value="1">{m.public_visibility()}</option>
					<option selected={visibility === '0'} value="0">{m.protected_visibility()}</option>
					<option selected={visibility === '-1'} value="-1">{m.private_visibility()}</option>
				</select>
			</label>
			{#if visibility === '1'}
				<span class="text-primary-200">{m.public_description()}</span>
			{:else if visibility === '0'}
				<span class="text-secondary-200">{m.protected_description()}</span>
			{:else}
				<span class="text-red-200">{m.private_description()}</span>
			{/if}

			<label class="label m-2 flex items-center justify-center gap-5 selection:outline-none">
				<span class="text-nowrap">{m.tags()} :</span>

				<Combobox data={tagsData} multiple bind:value={tags} placeholder="Select..."
					>{#snippet item(item)}
						<div class="flex w-full justify-between space-x-2">
							<span>{item.label}</span>
						</div>
					{/snippet}</Combobox
				>

				<div></div>
			</label>
		</div>
		<div class="absolute right-2.5 flex h-full w-3 flex-col justify-center">
			<button aria-label="Show Params" onclick={() => (params_open = !params_open)}>
				<i class="fa-solid fa-angles-left bg-surface-800 hover:bg-surface-200 rounded-4xl p-2"></i>
			</button>
		</div>
	{:else}
		<div class="flex w-3 flex-col justify-center">
			<button
				aria-label="Show Params"
				disabled={!Boolean(data)}
				onclick={() => (params_open = !params_open)}
			>
				<i class="fa-solid fa-angles-right bg-surface-800 hover:bg-surface-200 rounded-4xl p-2"></i>
			</button>
		</div>
	{/if}
</div>

<style>
	:global(.ig-input) {
		outline-style: none;
	}
</style>
