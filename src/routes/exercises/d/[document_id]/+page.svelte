<script lang="ts">
	import { goto } from '$app/navigation';
	import Exercise from '$lib/document/exercises/Exercise.svelte';

	/** @type {import('./$types').PageProps} */
	let { data } = $props();
	let document_id = data.document_id;
</script>

<Exercise {document_id} onFetchFail={() => goto('/exercises/error', { state: 404 })} />
