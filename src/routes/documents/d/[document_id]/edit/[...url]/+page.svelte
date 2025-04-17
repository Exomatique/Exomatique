<script lang="ts">
	import { goto } from '$app/navigation';
	import Document from '$lib/document/Document.svelte';

	/** @type {import('./$types').PageProps} */
	let { data } = $props();
	let document_id = data.document_id;
	let url = data.url;
</script>

<Document {url} {document_id} onFetchFail={() => goto('/documents/error', { state: 404 })} />
