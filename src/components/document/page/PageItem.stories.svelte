<script module>
	import { default_icon } from '$lib/document';
	import PageItem from './PageItem.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'Document/Page/PageItem',
		component: PageItem,
		tags: ['autodocs'],
		argTypes: {}
	});
</script>

<Story
	name="Document"
	args={{
		page: {
			address: {
				document_id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
				path: '/'
			},
			created: new Date(0),
			updated: new Date(),
			type: 'page',
			data: {
				title: 'Title',
				content: [],
				icon: default_icon
			},
			extra: {}
		}
	}}
/>
