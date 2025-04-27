<script lang="ts">
	import { goto } from '$app/navigation';
	import Editor from '$lib/document/Editor.svelte';
	import Document from '$lib/document/Document.svelte';
	import { get } from '$lib/utils';
	import { onMount } from 'svelte';
	import Loading from '../../../../../components/Loading.svelte';
	import { type DocumentMeta } from '$lib/document';
	import { user } from '../../../../../store';
	import type { ExoData } from '@exomatique_editor/base';
	import { getRootAddress, read } from '$lib/file/distant_fs';
	import type { FileAddress, PageFile } from '$lib/file/types';
	import { href } from '$lib/page/links';
	import { resolvePageAddress } from '$lib/utils/link';
	import NavigationModule from '$lib/editor/navigation/NavigationModule';

	/** @type {import('./$types').PageProps} */
	let { data: fetch } = $props();

	let document_id = $derived(fetch.document_id as string);
	let url = $derived(fetch.url);

	let document: DocumentMeta | undefined = $state(undefined);
	let data: ExoData | undefined = $state(undefined);
	let address = $derived({ document_id: document_id, path: url });
	let real_address = $derived.by(() => resolvePageAddress(address));
	let title = $state('');

	onMount(() => {
		get('/document', { document_id })
			.then((v) => {
				document = v.meta as DocumentMeta;
			})
			.catch((e) => {
				goto('/documents/error');
			});

		read({ ...real_address }, 'page').then((v) => {
			if (!v || !(v as any satisfies PageFile)) {
				goto('/documents/error');
				return;
			}
			let page = v as PageFile;

			if (page) {
				data = page.data.content;
				title = page.data.title;
			}
		});
	});
</script>

<div class="relative flex h-full flex-1 justify-center">
	<div class="absolute w-3/4 grow flex-row bg-white text-neutral-950 scheme-light">
		{#if data}
			<div class="flex w-full grow justify-end px-5 py-2">
				<h5 class="h5 mx-5 w-full px-2">{title}</h5>

				{#if document && document.authorId === $user?.id}
					<a
						class="btn bg-surface-200 hover:bg-surface-400 self-end"
						href={href(real_address, true)}>Edit</a
					>
				{/if}
			</div>
			<Editor
				bind:data
				extra_modules={[new NavigationModule()]}
				provideContext={(editor) => {
					editor.addContext('root', getRootAddress(document_id));
					editor.addContext('resolver', (v: FileAddress) => href(v, false));
				}}
			/>
		{:else}
			<div class=" pr-2 pb-2">
				<div class="flex w-full grow justify-center shadow-2xl">
					<Loading size={'extra-large'} />
				</div>
			</div>
		{/if}
	</div>
</div>
