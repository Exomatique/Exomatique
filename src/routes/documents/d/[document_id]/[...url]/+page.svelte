<script lang="ts">
	import Document from '$lib/document/Document.svelte';
	import type { DocumentMeta } from '$lib/document/types.js';
	import type { PageFile } from '$lib/file/types.js';

	/** @type {import('./$types').PageProps} */
	let { data = $bindable() } = $props();
	let document_id = $derived(data.document_id as string);
	let url = $derived(data.url);

	let document_map = new Map<string, DocumentMeta>();
	let page_map = new Map<string, PageFile>();
</script>

<Document address={{ document_id, path: url }} {document_map} {page_map} />
