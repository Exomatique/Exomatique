<script module lang="ts">
	import ComboboxRework from './Combobox.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'utils/ComboboxRework',
		component: ComboboxRework,
		tags: ['autodocs'],
		argTypes: {}
	});
</script>

<Story
	name="ComboboxRework not multiple"
	args={{
		data: [
			{ label: 'Test 1', value: '1' },
			{ label: 'Test 2', value: '2' },
			{ label: 'Test 3', value: '3' },
			{ label: 'Test 4', value: '4' },
			{ label: 'Test 5', value: '5' },
			{ label: 'Test 6', value: '6' },
			{ label: 'Test 7', value: '7' },
			{ label: 'Test 8', value: '8' },
			{ label: 'Test 9', value: '9' }
		],
		value: ['1']
	}}
/>

<Story
	name="ComboboxRework multiple"
	args={{
		data: [
			{ label: 'Test 1', value: '1' },
			{ label: 'Test 2', value: '2' },
			{ label: 'Test 3', value: '3' },
			{ label: 'Test 4', value: '4' },
			{ label: 'Test 5', value: '5' },
			{ label: 'Test 6', value: '6' },
			{ label: 'Test 7', value: '7' },
			{ label: 'Test 8', value: '8' },
			{ label: 'Test 9', value: '9' }
		],
		multiple: true
	}}
/>
