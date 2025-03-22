<script lang="ts">
	import type { ExoData } from '@exomatique/editor';
	import {
		DefinitionModule,
		Editor,
		ExoEditor,
		LatexModule,
		MdModule,
		TheoremModule,
		VideoModule
	} from '@exomatique/editor';

	let { data = $bindable(), editable = $bindable(false) }: { data: ExoData; editable?: boolean } =
		$props();

	const exo_editor = new ExoEditor({
		modules: [
			new MdModule(),
			new DefinitionModule(),
			new TheoremModule(),
			new LatexModule(),
			new VideoModule()
		],
		default_module: 'md'
	});
</script>

{#key editable}
	<Editor {exo_editor} {editable} bind:data />
{/key}
