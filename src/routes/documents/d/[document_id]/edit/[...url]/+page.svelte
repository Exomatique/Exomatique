<script lang="ts">
	import { afterNavigate, goto } from '$app/navigation';
	import Document from '$lib/document/Document.svelte';

	/** @type {import('./$types').PageProps} */
	let { data = $bindable() } = $props();
	let document_id = $derived(data.document_id as string);
	let url = $derived(data.url);
</script>

<Document
	address={{ document_id, path: url }}
	onFetchFail={() => goto('/documents/error', { state: 404 })}
/>
