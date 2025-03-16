<script module>
	import Combobox from './Combobox.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'utils/Combobox',
		component: Combobox,
		tags: ['autodocs'],
		argTypes: {}
	});
</script>

<Story
	name="Combobox not multiple"
	args={{
		data: [
			{ label: 'Test 1', value: '1' },
			{ label: 'Test 2', value: '2' },
			{ label: 'Test 3', value: '3' }
		]
	}}
/>

<Story
	name="Combobox multiple"
	args={{
		multiple: true,
		data: [
			{ label: 'Test 1', value: '1' },
			{ label: 'Test 2', value: '2' },
			{ label: 'Test 3', value: '3' }
		]
	}}
/>
