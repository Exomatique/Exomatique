<script lang="ts">
	import Exercise from '$lib/document/exercises/Exercise.svelte';

	/** @type {import('./$types').PageProps} */
	let { data } = $props();
	let document_id = data.document_id;
</script>

<Exercise {document_id} />
