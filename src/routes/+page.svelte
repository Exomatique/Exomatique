<script>
	import Icon from '../components/Icon.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { Construction, Github } from '@lucide/svelte';
</script>

<div class="flex h-full w-full flex-1 items-center justify-center">
	<div class="relative flex flex-col items-center rounded-xl border-2 border-yellow-600 p-10">
		<Icon size={'small'} />

		<p class="mt-5 self-start">
			{m.home_0()}
		</p>
		<p class="mt-5 self-start">
			{m.home_1()}
		</p>
		<p class="mt-5 self-start">
			{m.home_2()}
		</p>

		<div class="mt-5 flex flex-row items-center gap-5">
			<a
				class="opacity-50 hover:opacity-100"
				href="https://github.com/Exomatique/Exomatique"
				target="_blank"
			>
				<Github size="110" />
			</a>
			<a
				class="opacity-50 hover:opacity-100"
				aria-label="discord invite"
				href="https://discord.gg/Fxj2VCv8pH"
				target="_blank"
			>
				<img alt="discord invite" src="http://invidget.switchblade.xyz/Fxj2VCv8pH" />
			</a>
		</div>
	</div>
</div>
