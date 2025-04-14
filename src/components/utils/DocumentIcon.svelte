<script lang="ts">
	import * as lucide_icons from '@lucide/svelte';
	import type { IconMeta } from '$lib/types';

	let {
		icon,
		size,
		backgroundColor = 'white'
	}: { icon: IconMeta; size: number; backgroundColor: string } = $props();
</script>

<div class="relative h-fit w-fit">
	{#if icon.library === 'lucide'}
		{@const Icon = (lucide_icons as any)[icon.value]}
		<Icon {size} />
	{/if}

	{#if icon.numbering !== undefined && icon.numbering !== -1}
		<div
			class={'border-' +
				backgroundColor +
				' absolute right-0 bottom-0 flex h-10 w-10 items-center justify-center rounded-full border-4 bg-black p-1 font-bold text-white select-none'}
		>
			{icon.numbering}
		</div>
	{/if}
</div>
