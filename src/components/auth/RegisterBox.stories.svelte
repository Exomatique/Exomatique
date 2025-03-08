<script module>
	import RegisterBox from './RegisterBox.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from '@storybook/test';

	const { Story } = defineMeta({
		title: 'Auth/RegisterBox',
		component: RegisterBox,
		tags: ['autodocs'],
		argTypes: {}
	});
</script>

<Story name="Default" args={{}} />
