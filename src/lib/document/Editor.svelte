<script lang="ts">
	import type { ExoData, SemanticVariant } from '@exomatique/editor';
	import {
		Editor,
		ExoEditor,
		LatexModule,
		MdModule,
		SemanticModule,
		VideoModule
	} from '@exomatique/editor';

	let { data = $bindable(), editable = $bindable(false) }: { data: ExoData; editable?: boolean } =
		$props();

	const simple_variant = (
		name: string,
		color: string,
		title?: boolean,
		spoiler?: boolean
	): SemanticVariant => ({
		name: name,
		baseColor: { type: 'static', value: color },
		prefix: { type: 'static', value: name },
		spoiler: { type: 'static', value: spoiler || false },
		title: title === false ? { type: 'none' } : { type: 'editable', value: '' }
	});

	const variants: SemanticVariant[] = [
		{
			name: 'Custom Box',
			baseColor: { type: 'editable', value: '#000000' },
			prefix: { type: 'editable', value: 'Custom Box' },
			spoiler: { type: 'editable', value: false },
			title: { type: 'editable', value: '' }
		},
		simple_variant('Definition', '#0000ff'),
		simple_variant('Theorem', '#ff0000'),
		simple_variant('Question', '#000000'),
		simple_variant('Hint', '#cccc00', false, true),
		simple_variant('Solution', '#00aa00', false, true)
	];

	const exo_editor = new ExoEditor({
		modules: [new MdModule(), new SemanticModule(variants), new LatexModule(), new VideoModule()],
		default_module: 'md'
	});
</script>

{#key editable}
	<Editor {exo_editor} {editable} bind:data />
{/key}
