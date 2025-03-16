<script lang="ts" generics="T extends ComboboxItem">
	import { fade } from 'svelte/transition';
	import * as combobox from '@zag-js/combobox';
	import { useMachine, normalizeProps, mergeProps } from '@zag-js/svelte';
	import type { Snippet } from 'svelte';

	export interface ComboboxProps<T extends ComboboxItem>
		extends Omit<combobox.Props, 'id' | 'collection'> {
		/** Provide the list of label and value data */
		data?: T[];
		/** Set the label to display. */
		label?: string;
		/** Set z-index for the positioner. */
		zIndex?: string;
		/** Bindable value property*/
		value: string[];
		/** Mutliple */
		multiple: boolean;

		// Base ---
		/** Set base classes for the root element. */
		base?: string;
		/** Set width classes for the root element. */
		width?: string;
		/** Provide arbitrary classes for the root element. */
		classes?: string;

		// Label ---
		/** Set base classes for the label. */
		labelBase?: string;
		/** Set text and font classes for the label. */
		labelText?: string;
		/** Provide arbitrary classes for the label. */
		labelClasses?: string;

		// Input Group ---
		/** Set base classes for the input group. */
		inputGroupBase?: string;
		/** Set input classes for the input group. */
		inputGroupInput?: string;
		/** Set button classes for the input group. */
		inputGroupButton?: string;
		/** Set arrow classes for the input group. */
		inputGroupArrow?: string;
		/** Provide arbitrary classes for the input group. */
		inputGroupClasses?: string;

		// Multiple Chips ---
		/** Set base classes for the chip container*/
		chipContainerBase?: string;
		/** Set base classes for chips*/
		chipBase?: string;

		// Positioner ---
		/** Set base classes for the positioner. */
		positionerBase?: string;
		/** Provide arbitrary classes for the positioner. */
		positionerClasses?: string;

		// Content ---
		/** Set base classes for the content. */
		contentBase?: string;
		/** Set background classes for the content. */
		contentBackground?: string;
		/** Set space-y classes for the content. */
		contentSpaceY?: string;
		/** Provide arbitrary classes for the content. */
		contentClasses?: string;

		// Option ---
		/** Set base classes for the option. */
		optionBase?: string;
		/** Set focus classes for the option. */
		optionFocus?: string;
		/** Set hover classes for the option. */
		optionHover?: string;
		/** Set active classes for the option. */
		optionActive?: string;
		/** Provide arbitrary classes for the option. */
		optionClasses?: string;

		// Snippets ---
		/** Provide a custom arrow icon. */
		arrow?: Snippet;
		/** Provide a custom template for the option. */
		item?: Snippet<[T]>;

		// Events ---
		/** Handle the combobox dropdown button click event. */
		onclick?: (event: Event) => void;
	}

	export interface ComboboxItem {
		label: string;
		value: string;
	}

	let {
		data = [],
		multiple = false,
		label = '',
		zIndex = 'auto',
		// Base
		base = '',
		width = '',
		classes = '',
		// Label
		labelBase = 'label',
		labelText = 'label-text',
		labelClasses = '',
		// Input
		inputGroupBase = 'input-group grid-cols-[1fr_auto]',
		inputGroupInput = 'ig-input',
		inputGroupButton = 'ig-btn hover:preset-tonal',
		inputGroupArrow = '',
		inputGroupClasses = '',
		// Chips
		chipContainerBase = 'chip-container',
		chipBase = 'chip preset-filled',
		// Positioner
		positionerBase = '',
		positionerClasses = '',
		// Content
		contentBase = 'card p-2',
		contentBackground = 'preset-outlined-surface-200-800 bg-surface-50-950',
		contentSpaceY = 'space-y-1',
		contentClasses = '',
		// Option
		optionBase = 'btn justify-start w-full',
		optionHover = 'hover:preset-tonal',
		optionActive = 'preset-filled-primary-500',
		optionClasses = '',
		// Snippets
		arrow,
		item,
		// Events
		onclick,
		value = $bindable([]),
		// Zag ---
		...zagProps
	}: ComboboxProps<T> = $props();

	// Zag
	let options = $state.raw(data);
	const collection = $derived(
		combobox.collection({
			items: data,
			// Map data structure
			itemToValue: (item) => item.value,
			itemToString: (item) => item.label,
			isItemDisabled: (item) => false
		})
	);

	// Manage multiple
	let input = $state('');

	const id = $props.id();
	const service = useMachine(combobox.machine, () => ({
		id: id,
		collection: collection,
		closeOnSelect: !multiple,
		...zagProps,
		onOpenChange(event) {
			options = multiple ? data.filter((item) => !value.includes(item.value)) : data;
			zagProps.onOpenChange?.(event);
		},
		onValueChange(event) {
			if (multiple) {
				value = value.concat(event.value);
				input = '';
				options = multiple ? data.filter((item) => !value.includes(item.value)) : data;
			} else {
				value = event.value;
			}
		},
		onInputValueChange(event) {
			const filtered = data.filter((item) =>
				item.label.toLowerCase().includes(event.inputValue.toLowerCase())
			);
			const used = multiple ? filtered.filter((item) => !value.includes(item.value)) : filtered;
			collection.setItems(used);
			options = used;
			zagProps.onInputValueChange?.(event);
		}
	}));
	const api = $derived(combobox.connect(service, normalizeProps));
	const triggerProps = $derived(mergeProps(api.getTriggerProps(), { onclick }));
	$inspect(value);
</script>

<span {...api.getRootProps()} class="{base} {width} {classes}" data-testid="combobox">
	<!-- Label -->
	<label {...api.getLabelProps()} class="{labelBase} {labelClasses}">
		{#if label}<span class={labelText}>{label}</span>{/if}
		<!-- Input Group -->
		<div {...api.getControlProps()} class="{inputGroupBase} {inputGroupClasses}">
			<!-- Input -->
			<input {...api.getInputProps()} bind:value={input} class={inputGroupInput} />
			<!-- Arrow -->
			<button {...triggerProps} class={inputGroupButton}>
				{#if arrow}
					{@render arrow()}
				{:else}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						style="opacity: 0.5"
						class={inputGroupArrow}
					>
						<path d="m6 9 6 6 6-6" />
					</svg>
				{/if}
			</button>
		</div>

		<!-- Chips -->
		{#if multiple}
			<div class={chipContainerBase}>
				{#each data.filter((v) => value.includes(v.value)) as { label, value: v }}
					<button
						type="button"
						class={chipBase}
						onclick={() => (value = value.filter((x) => x != v))}>{label} x</button
					>
				{/each}
			</div>
		{/if}
	</label>
	<!-- Menu -->
	{#if api.open}
		<div
			{...api.getPositionerProps()}
			transition:fade={{ duration: 100 }}
			class="{positionerBase} {positionerClasses}"
		>
			{#if options.length > 0}
				<!-- Content (list) -->
				<nav
					{...api.getContentProps()}
					class="{contentBase} {contentBackground} {contentSpaceY} {contentClasses}"
					style="z-index: {zIndex}"
				>
					{#each options as option (option.label)}
						{@const isChecked = api.getItemProps({ item: option })['data-state'] === 'checked'}
						{@const displayClass = isChecked ? optionActive : optionHover}
						<!-- Option -->
						<!-- ZagJs should have set button type to "button" here. -->
						<!-- See https://github.com/skeletonlabs/skeleton/pull/2998#discussion_r1855511385 -->
						<button
							{...api.getItemProps({ item: option })}
							class="{optionBase} {displayClass} {optionClasses}"
							type="button"
						>
							{#if item}
								{@render item(option)}
							{:else}
								{option.label}
							{/if}
						</button>
					{/each}
				</nav>
			{/if}
		</div>
	{/if}
</span>

<style>
	[data-part='item'][data-highlighted]:not([data-state='checked']) {
		background-color: var(--color-surface-200-800);
	}

	.ig-input {
		outline: none;
	}

	.chip-container {
		display: flex;
		flex-direction: row;
		gap: 5px;
	}
</style>
