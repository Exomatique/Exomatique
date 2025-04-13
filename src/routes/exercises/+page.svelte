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
	import { user } from '../../store';
	import { mapNumberToVisiblity } from '$lib/document';

	interface ComboboxData {
		label: string;
		value: string;
	}

	let exercises: ExerciseMeta[] | undefined = $state(undefined);
	let isCreating = $state(false);
	let isSearching = $state(true);

	async function onNewDocument() {
		isCreating = true;
		const obj = await post('/document/create').finally(() => (isCreating = false));
		const id = obj.document.id;

		goto('/exercises/d/' + id + '/edit');
	}

	async function onSearch(force?: true) {
		if (isSearching && !force) return;
		exercises = undefined;
		isSearching = true;

		const v = await get('/document/query', { title: filterInput, tag: filterTags }).finally(
			() => (isSearching = false)
		);

		exercises = v.data.map((v: any) => ({ ...v, visibility: mapNumberToVisiblity(v.visibility) }));
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
	let container: HTMLElement | undefined = $state();
</script>

<div class="relative flex flex-col gap-5 p-5">
	<div class="relative flex flex-row items-center gap-5">
		<div class="bg-surface-900 flex flex-1 flex-row items-center gap-5 rounded-2xl p-5 text-lg">
			<input
				class="ig-input input max-w-md shrink grow-0 outline-none"
				placeholder={m.title()}
				type="text"
				bind:value={filterInput}
			/>

			<button class="btn bg-surface-800" onclick={() => onSearch()} disabled={isSearching}>
				<Search />
			</button>

			<div class="max-w-md">
				<Combobox
					data={tagsData || []}
					multiple
					bind:value={filterTags}
					bind:chipContainer={container}
				/>
			</div>

			<div class="flex flex-1">
				<div class="max-h-10 overflow-scroll" bind:this={container}></div>
			</div>
		</div>

		<button
			disabled={isCreating}
			onclick={onNewDocument}
			class={'btn bg-surface-700 self-start rounded-2xl p-7 ' + ($user ? '' : 'invisible')}
		>
			{m.new_exercise()}
			<FileText />
		</button>
	</div>

	<div class="flex flex-1 flex-row gap-5">
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
						<ExerciseBadge edit={$user && exo.authorId === $user.id} {...exo} />
					{/each}
				{:else}
					<h2 class="h5">{m.no_exercises_fail()}</h2>
				{/if}
			</div>
		{/if}
	</div>
</div>
