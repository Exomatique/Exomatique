<script module>
	import VisibilityBadge from './VisibilityBadge.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'Document/Visibility',
		component: VisibilityBadge,
		tags: ['autodocs'],
		argTypes: {}
	});
</script>

<Story
	name="Public"
	args={{
		value: 'PUBLIC'
	}}
/>

<Story
	name="Protected"
	args={{
		value: 'PROTECTED'
	}}
/>

<Story
	name="Private"
	args={{
		value: 'PRIVATE'
	}}
/>
