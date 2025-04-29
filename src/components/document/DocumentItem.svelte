<script lang="ts">
	import { lang } from '$lib/utils';
	import { Eye, Network, Pen } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { languageTag, setLanguageTag } from '$lib/paraglide/runtime';
	import VisibilityBadge from './VisibilityBadge.svelte';
	import { type DocumentMeta } from '$lib/document';
	import DocumentIcon from './DocumentIcon.svelte';
	import { getRootAddress } from '$lib/file/distant_fs';
	import { href } from '$lib/page/links';

	interface Props extends DocumentMeta {
		edit?: boolean;
	}

	const { edit = false, ...document }: Props = $props();

	let tags = $state(document.tags);

	onMount(async () => {
		let translated = await Promise.all(
			tags.map(async (v) => (await lang(v, languageTag()).catch(() => v)) || v)
		);
		tags = translated;
	});
</script>

<div
	class="card bg-surface-800 border-surface-200 shring relative flex grow basis-md flex-row gap-5 overflow-x-scroll rounded-2xl border-2 p-5"
>
	<DocumentIcon icon={document.icon} size={96} backgroundColor={'surface-800'} />

	<div class="shrink grow overflow-x-scroll">
		<h1 class="h5 mb-5 text-nowrap">{document.title}</h1>

		<div class="flex flex-row gap-1">
			<VisibilityBadge value={document.visibility} />
			{#each tags as tag}
				<div class="bg-surface-400 flex h-fit w-fit rounded-md px-2 py-1 text-nowrap">{tag}</div>
			{/each}
		</div>
	</div>

	<div class="flex flex-col">
		<div class="flex-end flex w-full gap-5">
			<a
				class="btn bg-surface-700 border-surface-500 self-end border-1"
				href={href(getRootAddress(document.id))}
				target="_blank"
			>
				<Eye />
			</a>
		</div>

		<div class="flex-1"></div>

		{#if edit}
			<div class="flex-end flex w-full gap-5">
				<a
					class="btn bg-surface-700 border-surface-500 self-end border-1"
					href={href(getRootAddress(document.id), true)}
					target="_blank"
				>
					<Pen />
				</a>
			</div>
		{/if}
	</div>
</div>
