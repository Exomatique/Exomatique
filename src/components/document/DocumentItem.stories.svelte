<script module>
	import DocumentItem from './DocumentItem.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'Document/Item',
		component: DocumentItem,
		tags: ['autodocs'],
		argTypes: {}
	});
</script>

<Story
	name="Document"
	args={{
		author: 'John Doe',
		authorId: '42',
		id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
		title: 'This is a testing document object',
		tags: ['logic', 'complexity'],
		visibility: 'PUBLIC',
		edit: false,
		icon: {
			library: 'lucide',
			value: 'Image'
		}
	}}
/>

<Story
	name="Document with a long title"
	args={{
		author: 'John Doe',
		authorId: '42',
		id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
		title:
			'Document with a really long name to test whether alignment works, it should grow the component and take multiple lines. ' +
			'Text '.repeat(100),
		tags: ['logic', 'complexity'],
		visibility: 'PUBLIC',
		edit: false,
		icon: {
			library: 'lucide',
			value: 'Image',
			numbering: 10
		}
	}}
/>

<Story
	name="Document with a lot of tags"
	args={{
		author: 'John Doe',
		authorId: '42',
		id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
		title: 'This is a testing document object',
		tags: 'logic,'
			.repeat(20)
			.split(',')
			.filter((v) => v.length > 0),
		visibility: 'PUBLIC',
		edit: false,
		icon: {
			library: 'lucide',
			value: 'Image'
		}
	}}
/>

<Story
	name="Document with everything big"
	args={{
		author: 'John Doe',
		authorId: '42',
		id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
		title:
			'Document with a really long name to test whether alignment works, it should grow the component and take multiple lines. ' +
			'Text '.repeat(100),
		tags: 'logic,'
			.repeat(20)
			.split(',')
			.filter((v) => v.length > 0),
		visibility: 'PUBLIC',
		edit: false,
		icon: {
			library: 'lucide',
			value: 'Image'
		}
	}}
/>
