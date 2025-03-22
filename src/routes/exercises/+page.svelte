<script lang="ts">
	import { goto } from '$app/navigation';
	import { get, post } from '$lib/utils';
	import { FileText, Search } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { onMount } from 'svelte';
	import Combobox from '../../components/utils/Combobox.svelte';
	import ExerciseBadge from '../../components/exercises/ExerciseItem.svelte';
	import type { ExerciseMeta } from '$lib/document/exercises';
	import Loading from '../../components/Loading.svelte';

	interface ComboboxData {
		label: string;
		value: string;
	}

	let exercises: ExerciseMeta[] | undefined = $state(undefined);
	let isCreating = $state(false);
	let isSearching = $state(true);

	async function onNewDocument() {
		isCreating = true;
		const obj = await post('/exercise/create').finally(() => (isCreating = false));
		const id = obj.document.id;

		goto('/exercises/d/' + id);
	}

	async function onSearch(force?: true) {
		if (isSearching && !force) return;
		exercises = undefined;
		isSearching = true;

		const v = await get('/exercise/query', { title: filterInput, tag: filterTags }).finally(
			() => (isSearching = false)
		);

		exercises = v.data;
	}

	let filterInput = $state('');
	let filterTags = $state([] as string[]);

	let tagsData: ComboboxData[] | undefined = $state(undefined);

	onMount(() => {
		get('/tags').then((v) => {
			tagsData = v.data as ComboboxData[];
		});

		onSearch(true);
	});
</script>

<div class="relative flex flex-col gap-5 p-5">
	<button
		disabled={isCreating}
		onclick={onNewDocument}
		class="btn bg-surface-700 self-start rounded-2xl p-5"
	>
		{m.new_exercise()}
		<FileText />
	</button>

	<div class="flex flex-1 flex-row gap-5">
		<div class="bg-surface-400 relative flex h-full flex-1 flex-col gap-5 rounded-2xl p-5">
			<h4 class="h4 mb-2">{m.search()}</h4>

			<div class="flex flex-nowrap items-center gap-5">
				<h5 class="h5">{m.title()}</h5>
				<input class="input" type="text" bind:value={filterInput} />
			</div>

			<div class="flex flex-nowrap items-center gap-5">
				<h5 class="h5 self-start">{m.tags()}</h5>
				<Combobox data={tagsData} multiple bind:value={filterTags} placeholder="Select..."
					>{#snippet item(item)}
						<div class="flex w-full justify-between space-x-2">
							<span>{item.label}</span>
						</div>
					{/snippet}
				</Combobox>
			</div>

			<button
				class="btn absolute right-5 bottom-5"
				onclick={() => onSearch()}
				disabled={isSearching}
			>
				<Search />
			</button>
		</div>

		{#if isSearching || !exercises}
			<div
				class="bg-surface-800 flex h-full w-2/3 flex-1/3 flex-row items-center justify-center gap-5 rounded-2xl p-5"
			>
				<Loading size={'extra-large'} />
			</div>
		{:else}
			<div
				class="bg-surface-800 flex h-full w-2/3 flex-1/3 flex-col items-center gap-5 rounded-2xl p-5"
			>
				{#if exercises.length > 0}
					{#each exercises as exo}
						<ExerciseBadge {...exo} />
					{/each}
				{:else}
					<h2 class="h5">{m.no_exercises_fail()}</h2>
				{/if}
			</div>
		{/if}
	</div>
</div>
