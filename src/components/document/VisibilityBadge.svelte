<script lang="ts">
	import type { DocumentVisibility } from '$lib/document';
	import * as m from '$lib/paraglide/messages.js';
	import { lang } from '$lib/utils';

	interface Props {
		value: DocumentVisibility;
	}

	const { value }: Props = $props();
</script>

{#if value === 'PUBLIC'}
	<div class="inline-flex rounded-md bg-green-400 px-2 py-1">{m.public_visibility()}</div>
{:else if value === 'PROTECTED'}
	<div class="inline-flex rounded-md bg-yellow-400 px-2 py-1">{m.protected_visibility()}</div>
{:else}
	<div class="inline-flex rounded-md bg-red-400 px-2 py-1">{m.private_visibility()}</div>
{/if}
