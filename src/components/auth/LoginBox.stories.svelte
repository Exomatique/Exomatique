<script module>
	import LoginBox from './LoginBox.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from '@storybook/test';

	const { Story } = defineMeta({
		title: 'Auth/LoginBox',
		component: LoginBox,
		tags: ['autodocs'],
		argTypes: {}
	});
</script>

<Story name="Default" args={{}} />
