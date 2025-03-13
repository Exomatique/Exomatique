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

	let data: ExoData | undefined = $state(undefined);

	let isSaving = $state(false);
	let lastSaved = $state(new Date().getTime());

	async function save() {
		lastSaved = new Date().getTime();
		isSaving = true;
		post('/document', { document_id, url: 'index.json', data }).finally(() => (isSaving = false));
	}

	onMount(() => {
		get('/document', { document_id, url: 'index.json' }).then((v) => {
			data = v.data;
		});
	});
</script>

<div class="relative flex h-full flex-1 justify-center">
	<div class="absolute w-3/4 grow flex-row bg-white text-neutral-950 scheme-light">
		{#if data}
			<div class="flex w-full grow justify-end px-5 py-2">
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
