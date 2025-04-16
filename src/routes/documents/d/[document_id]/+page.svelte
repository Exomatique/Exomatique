<script lang="ts">
	import { goto } from '$app/navigation';
	import Editor from '$lib/document/Editor.svelte';
	import Document from '$lib/document/Document.svelte';
	import { get } from '$lib/utils';
	import { onMount } from 'svelte';
	import Loading from '../../../../components/Loading.svelte';
	import { href, type DocumentMeta } from '$lib/document';
	import { user } from '../../../../store';
	import type { ExoData } from '@exomatique_editor/base';

	/** @type {import('./$types').PageProps} */
	let { data: fetch } = $props();
	let document_id = fetch.document_id;

	let document: DocumentMeta | undefined = $state(undefined);
	let data: ExoData | undefined = $state(undefined);
	let title = $state('');

	onMount(() => {
		get('/document', { document_id, url: 'index.json' })
			.then((v) => {
				document = v;
				data = JSON.parse(v.data || '[]');
				title = v.title;
			})
			.catch((e) => {
				goto('/documents/error');
			});
	});
</script>

<div class="relative flex h-full flex-1 justify-center">
	<div class="absolute w-3/4 grow flex-row bg-white text-neutral-950 scheme-light">
		{#if data}
			<div class="flex w-full grow justify-end px-5 py-2">
				<h5 class="h5 mx-5 w-full px-2">{title}</h5>

				{#if document && document.authorId === $user?.id}
					<a class="btn bg-surface-200 hover:bg-surface-400 self-end" href={href(document, true)}
						>Edit</a
					>
				{/if}
			</div>
			<Editor bind:data />
		{:else}
			<div class=" pr-2 pb-2">
				<div class="flex w-full grow justify-center shadow-2xl">
					<Loading size={'extra-large'} />
				</div>
			</div>
		{/if}
	</div>
</div>
