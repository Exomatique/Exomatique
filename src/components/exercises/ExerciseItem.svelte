<script lang="ts">
	import { href, type ExerciseMeta } from '$lib/document/exercises';
	import { lang } from '$lib/utils';
	import { Eye, Pen } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { languageTag, setLanguageTag } from '$lib/paraglide/runtime';
	import VisibilityBadge from '../document/VisibilityBadge.svelte';

	interface Props extends ExerciseMeta {
		edit?: boolean;
	}

	const { edit = false, ...exercise }: Props = $props();

	let tags = $state(exercise.tags);

	onMount(async () => {
		let translated = await Promise.all(
			tags.map(async (v) => (await lang(v, languageTag()).catch(() => v)) || v)
		);
		tags = translated;
	});
</script>

<div
	class="card bg-surface-800 border-surface-200 relative flex w-full flex-row gap-5 rounded-2xl border-2 p-5"
>
	<div class="flex-1">
		<h1 class="h5 mb-5">{exercise.title}</h1>

		<div class="flex flex-row flex-wrap gap-1">
			<VisibilityBadge value={exercise.visibility} />
			{#each tags as tag}
				<div class="bg-surface-400 rounded-md px-2 py-1">{tag}</div>
			{/each}
		</div>
	</div>

	<div class="flex flex-col">
		{#if edit}
			<a
				class="btn bg-surface-700 border-surface-500 self-start border-1"
				href={href(exercise, edit)}
				target="_blank"
			>
				<Pen />
			</a>
		{/if}

		<div class="flex-1"></div>

		<a
			class="btn bg-surface-700 border-surface-500 self-end border-1"
			href={href(exercise)}
			target="_blank"
		>
			<Eye />
		</a>
	</div>
</div>
