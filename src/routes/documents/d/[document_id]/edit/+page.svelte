<script lang="ts">
	import { goto } from '$app/navigation';
	import Document from '$lib/document/Document.svelte';

	/** @type {import('./$types').PageProps} */
	let { data } = $props();
	let document_id = data.document_id;
</script>

<Document {document_id} onFetchFail={() => goto('/documents/error', { state: 404 })} />
