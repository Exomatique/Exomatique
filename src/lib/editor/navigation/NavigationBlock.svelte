<script lang="ts">
	import type { ExoInstance } from '@exomatique_editor/base';
	import type { NavigationData } from './NavigationModule';
	import { getMeta, read } from '$lib/file/distant_fs';
	import Loading from '../../../components/Loading.svelte';
	import { type PageFile } from '$lib/file/types';
	import NavigationModule from './NavigationModule';
	import { MousePointerClick, MousePointerClickIcon } from '@lucide/svelte';
	import PageItem from '../../../components/document/page/PageItem.svelte';

	let {
		data = $bindable(),
		onchange,
		edition,
		instance,
		id,
		index,
		editable
	}: {
		data: NavigationData;
		onchange: (v: string) => void;
		edition: boolean;
		instance: ExoInstance;
		id: string;
		index: number;
		editable: boolean;
	} = $props();

	$effect(() => {
		if (!data.href.path.startsWith('/')) data.href.path = '/' + data.href.path;
	});
</script>

<div role="none" class="relative">
	{#if editable}
		<div class="flex flex-row gap-5">
			<h4>Link :</h4>
			<input type="text" bind:value={data.href.path} class="inline-block outline-none" />
		</div>
	{/if}
	{#await read(data.href)}
		<Loading size="medium" />
	{:then file}
		{#if file?.type !== 'page'}
			<h4 class="text-error-400">Unsupported file type</h4>
		{:else}
			{@const page = file as PageFile}
			<PageItem
				{page}
				href={(instance.getEditor().modules['navigation'] as NavigationModule)
					.context(instance.getEditor())
					.resolver(data.href)}
			/>
		{/if}
	{:catch}
		<h4 class="text-error-400">Error occured while trying to load file</h4>
	{/await}
</div>
