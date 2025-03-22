<script lang="ts">
	import { goto } from '$app/navigation';
	import Editor from '$lib/document/Editor.svelte';
	import Exercise from '$lib/document/exercises/Exercise.svelte';
	import { get } from '$lib/utils';
	import { onMount } from 'svelte';
	import Loading from '../../../../components/Loading.svelte';
	import type { ExoData } from '@exomatique/editor';
	import { href, type ExerciseMeta } from '$lib/document/exercises';

	/** @type {import('./$types').PageProps} */
	let { data: fetch } = $props();
	let document_id = fetch.document_id;

	let exercise: ExerciseMeta | undefined = $state(undefined);
	let data: ExoData | undefined = $state(undefined);
	let title = $state('');

	onMount(() => {
		get('/exercise', { document_id, url: 'index.json' })
			.then((v) => {
				exercise = v;
				data = v.data;
				title = v.title;
			})
			.catch(() => goto('/exercises/error'));
	});
</script>

<div class="relative flex h-full flex-1 justify-center">
	<div class="absolute w-3/4 grow flex-row bg-white text-neutral-950 scheme-light">
		{#if data}
			<div class="flex w-full grow justify-end px-5 py-2">
				<h5 class="h5 mx-5 w-full px-2">{title}</h5>

				{#if exercise}
					<a class="btn bg-surface-200 hover:bg-surface-400 self-end" href={href(exercise, true)}
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
