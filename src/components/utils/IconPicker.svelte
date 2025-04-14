<script lang="ts">
	import type { IconMeta } from '$lib/types';
	import * as m from '$lib/paraglide/messages';
	import DocumentIcon from '../document/DocumentIcon.svelte';
	import { onMount } from 'svelte';
	import Loading from '../Loading.svelte';

	interface ProvidedIcon {
		Icon: any;
		key: string;
	}

	let {
		onSubmit,
		onQuit,
		selected_icon = $bindable(undefined)
	}: {
		onSubmit?: (v: IconMeta) => void;
		onQuit?: () => void;
		selected_icon?: IconMeta | undefined;
	} = $props();

	let loaded = $state(false);

	let lucide_icons: ProvidedIcon[] = $state([]);

	let filter = $state('');
	let filtered = $state([] as ProvidedIcon[]);
	let input_timeout: NodeJS.Timeout | undefined;

	function updateFiltered(filtered_copy: string) {
		filtered = lucide_icons.filter((v) => v.key.toLowerCase().includes(filtered_copy));
	}

	onMount(async () => {
		import('@lucide/svelte').then((loaded_lucide_icons) => {
			lucide_icons = Object.keys(loaded_lucide_icons)
				.map((v) => ({ Icon: (loaded_lucide_icons as any)[v], key: v }))
				.filter((v, i) => typeof v.Icon === 'function');
			updateFiltered(filter);
			loaded = true;
		});
	});

	$effect(() => {
		const copy = filter;
		if (input_timeout) clearTimeout(input_timeout);
		input_timeout = setTimeout(() => updateFiltered(copy), 100);
	});
</script>

<div role="none" class="bg-surface-100 relative flex h-full w-full flex-row gap-1">
	<div class="bg-surface-200 max-h-80 flex-3/6 px-10">
		<input class="input my-5 outline-none selection:outline-none" bind:value={filter} />

		{#if loaded}
			<div class="grid-ga h grid max-h-50 grid-cols-5 items-center gap-2 overflow-scroll">
				{#each filtered as v}
					<button
						class="btn bg-surface-200 hover:bg-surface-400"
						onclick={() => {
							selected_icon = {
								library: 'lucide',
								value: v.key,
								numbering: undefined
							};
						}}
					>
						<v.Icon size={48} color="black" /></button
					>
				{/each}
			</div>
		{:else}
			<div class="my-5 flex w-full items-center justify-center">
				<Loading size={'medium'} />
			</div>
		{/if}
	</div>

	{#if selected_icon}
		<div class="flex flex-2/6 flex-col items-center rounded-md px-5 py-2">
			<DocumentIcon icon={selected_icon} size={96} backgroundColor={'surface-100'} />

			<h5 class="h5 text-nowrap">
				{m.numbering()}

				<input
					type="checkbox"
					checked={selected_icon.numbering !== undefined}
					onchange={(e) => {
						const checked = e.currentTarget.checked;
						if (checked && selected_icon) selected_icon.numbering = 0;
						else if (selected_icon) selected_icon.numbering = undefined;
					}}
				/>

				{#if selected_icon.numbering !== undefined}
					<input
						class="w-16"
						id="numbering"
						aria-label={m.numbering()}
						type="number"
						max={100}
						min={0}
						bind:value={selected_icon.numbering}
					/>
				{/if}
			</h5>

			<div class="flex-1"></div>
			<div class="flex w-full justify-evenly py-5">
				<button class="btn btn-base bg-surface-200" onclick={() => (selected_icon = undefined)}
					>Reset</button
				>

				<button
					class="btn btn-base bg-success-200"
					onclick={() => {
						if (selected_icon && onSubmit) onSubmit(selected_icon);
					}}>Confirm</button
				>
			</div>
		</div>
	{/if}

	{#if onQuit}
		<button
			class="btn btn-icon bg-error-300 absolute top-0 right-0 p-1"
			onclick={() => {
				if (onQuit) onQuit();
			}}
		>
			+
		</button>
	{/if}
</div>
