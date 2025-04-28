<script lang="ts">
	import { goto } from '$app/navigation';
	import DocumentEditor from '$lib/document/DocumentEditor.svelte';

	/** @type {import('./$types').PageProps} */
	let { data = $bindable() } = $props();
	let document_id = $derived(data.document_id as string);
	let url = $derived(data.url);
</script>

<DocumentEditor
	address={{ document_id, path: url }}
	onFetchFail={() => goto('/documents/error', { state: 404 })}
/>
