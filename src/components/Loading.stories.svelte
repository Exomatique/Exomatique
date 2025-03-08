<script module>
	import Loading from './Loading.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'Loading',
		component: Loading,
		tags: ['autodocs'],
		argTypes: {
			size: {
				control: { type: 'select' },
				options: ['extra-small', 'small', 'medium', 'large', 'extra-large']
			},
			color: {
				control: { type: 'text' }
			}
		}
	});
</script>

<Story name="Extra Large" args={{ size: 'extra-large' }} />

<Story name="Large" args={{ size: 'large' }} />

<Story name="Medium" args={{ size: 'medium' }} />

<Story name="Small" args={{ size: 'small' }} />

<Story name="Extra Small" args={{ size: 'extra-small' }} />
