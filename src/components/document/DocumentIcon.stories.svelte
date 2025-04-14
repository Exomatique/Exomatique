<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import DocumentIcon from './DocumentIcon.svelte';

	const { Story } = defineMeta({
		title: 'utils/DocumentIcon',
		component: DocumentIcon,
		tags: ['autodocs'],
		argTypes: {}
	});
</script>

<Story
	name="DocumentIcon Default"
	args={{
		icon: {
			library: 'lucide',
			value: 'ArrowDown'
		},
		size: 96
	}}
/>

<Story
	name="DocumentIcon Numbering"
	args={{
		icon: {
			library: 'lucide',
			value: 'ArrowDown',
			numbering: 1
		},
		size: 96
	}}
/>
