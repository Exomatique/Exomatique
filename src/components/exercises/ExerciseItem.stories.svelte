<script module>
	import ExerciseItem from './ExerciseItem.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'Exercise/Item',
		component: ExerciseItem,
		tags: ['autodocs'],
		argTypes: {}
	});
</script>

<Story
	name="Exercise"
	args={{
		author: 'John Doe',
		authorId: '42',
		id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
		title: 'This is a testing exercise object',
		tags: ['logic', 'complexity'],
		visibility: 'PUBLIC',
		edit: false
	}}
/>

<Story
	name="Exercise with a long title"
	args={{
		author: 'John Doe',
		authorId: '42',
		id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
		title:
			'Exercise with a really long name to test whether alignment works, it should grow the component and take multiple lines. ' +
			'Text '.repeat(100),
		tags: ['logic', 'complexity'],
		visibility: 'PUBLIC',
		edit: false
	}}
/>

<Story
	name="Exercise with a lot of tags"
	args={{
		author: 'John Doe',
		authorId: '42',
		id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
		title: 'This is a testing exercise object',
		tags: 'logic,'
			.repeat(20)
			.split(',')
			.filter((v) => v.length > 0),
		visibility: 'PUBLIC',
		edit: false
	}}
/>

<Story
	name="Exercise with everything big"
	args={{
		author: 'John Doe',
		authorId: '42',
		id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
		title:
			'Exercise with a really long name to test whether alignment works, it should grow the component and take multiple lines. ' +
			'Text '.repeat(100),
		tags: 'logic,'
			.repeat(20)
			.split(',')
			.filter((v) => v.length > 0),
		visibility: 'PUBLIC',
		edit: false
	}}
/>
