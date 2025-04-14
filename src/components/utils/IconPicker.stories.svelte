<script module lang="ts">
	import IconPicker from './IconPicker.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'utils/IconPicker',
		component: IconPicker,
		tags: ['autodocs'],
		argTypes: {}
	});
</script>

<Story name="IconPicker Default" args={{}} />
