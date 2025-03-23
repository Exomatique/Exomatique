<script lang="ts">
	import { Check, ChevronDown, X } from '@lucide/svelte';
	import { onMount } from 'svelte';

	interface Props {
		data: { value: string; label: string }[];
		value: string[];
		multiple: boolean;
		chipContainer?: HTMLElement;
	}

	let {
		data,
		chipContainer = $bindable(),
		value = $bindable([]),
		multiple = false
	}: Props = $props();

	let element: HTMLElement;
	let thisChipContainer: HTMLElement | undefined = $state(undefined);
	let filter = $state(
		multiple ? '' : value.length === 0 ? '' : data.find((v) => v.value === value[0])?.label || ''
	);
	let ignore_filter = $state(false);
	let open = $state(false);

	function getFiltered() {
		return data.filter((v) => ignore_filter || v.label.includes(filter));
	}

	$effect(() => {
		if (thisChipContainer)
			if (chipContainer) {
				chipContainer.appendChild(thisChipContainer);
			}
	});
</script>

<div
	bind:this={element}
	class="relative"
	role="combobox"
	aria-controls="combobox-values"
	aria-expanded={open}
	tabindex="-1"
	onfocusout={(e) => {
		if (e.relatedTarget && element.contains(e.relatedTarget as any)) return;
		open = false;
		if (!multiple) {
			ignore_filter = false;
			if (getFiltered().length !== 1) {
				filter = '';
				value = [];
			} else {
				filter = getFiltered()[0].label;
				value = [getFiltered()[0].value];
			}
		} else {
			filter = '';
		}
	}}
	onkeydown={(e) => {
		if (e.key === 'Escape') open = false;
	}}
>
	<div
		class="border-surface-800 rounded-base m-0 my-2 flex flex-row items-center items-start border-2 p-0"
	>
		<input
			class="ig-input flex-1 items-start px-2 outline-none"
			bind:value={filter}
			onfocusin={() => {
				open = true;
				if (getFiltered().length === 1) {
					ignore_filter = true;
				}
			}}
			onkeydown={() => {
				ignore_filter = false;
			}}
			class:text-red-400={getFiltered().length === 0}
		/>

		<button
			class="ig-input-arrow btn-icon bg-surface-800 h-full rounded-none py-2"
			onclick={() => {
				open = true;
				ignore_filter = true;
			}}
		>
			<ChevronDown />
		</button>
	</div>

	{#if multiple}
		<div bind:this={thisChipContainer} class="flex flex-1 flex-row flex-wrap gap-2">
			{#each data.filter((v) => value.includes(v.value)) as { value: data_value, label }}
				<button
					class="chip bg-surface-600"
					onclick={() => {
						value = value.filter((v) => v !== data_value);
					}}>{label} <X size="10px" /></button
				>
			{/each}
		</div>
	{/if}

	<div
		id="combobox-values"
		class="combobox-values bg-surface-900 border-surface-500 absolute z-1 my-2 max-h-40 w-full items-center overflow-scroll rounded-md border-2 px-1 py-2"
		class:hidden={!open}
	>
		{#each getFiltered() as { value: data_value, label }}
			{@const checked = value.includes(data_value)}
			<button
				class="hover:bg-surface-800 rounded-base flex w-full flex-1 px-2 py-2 outline-none"
				tabindex="-1"
				onclick={() => {
					if (checked) value = value.filter((v) => v !== data_value);
					else {
						value = multiple ? value.concat(data_value) : [data_value];
						if (!multiple) filter = label;
						else filter = '';
						ignore_filter = true;
					}
				}}
			>
				<div class="w-8" class:invisible={!checked}>
					<Check />
				</div>
				<p class="flex-1 items-center text-center">{label}</p>
				<div class="w-8"></div>
			</button>
		{/each}
	</div>
</div>

<style>
	.ig-input {
		border-radius: 0;
		background-color: transparent;
		border-radius: 0;
		display: block;
		width: 100%;
		font-size: var(--text-base)
			/* calc(1rem * var(--text-scaling)) = calc(16px * var(--text-scaling)) */;
		line-height: var(--text-base--line-height) /* calc(calc(1.5 / 1) ≈ 1.5 * var(--text-scaling)) */;
		padding-block: calc(var(--spacing) * 1) /* 0.25rem = 4px */;
		padding-inline: calc(var(--spacing) * 3) /* 0.75rem = 12px */;
		outline-color: transparent;
		border-width: 0;
		box-shadow:
			var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow),
			var(--tw-ring-shadow), var(--tw-shadow);
		&:active {
			--tw-ring-color: var(--color-primary-500) /* oklch(55.6% 0 0deg) = #737373 */;
		}
		&:focus {
			--tw-ring-color: var(--color-primary-500) /* oklch(55.6% 0 0deg) = #737373 */;
		}
		&:focus-within {
			--tw-ring-color: var(--color-primary-500) /* oklch(55.6% 0 0deg) = #737373 */;
		}
		&::placeholder {
			color: var(--color-surface-700-300)
				/* light-dark(var(--color-surface-700), var(--color-surface-300)) */;
		}
	}
</style>
