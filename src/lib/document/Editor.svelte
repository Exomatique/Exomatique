<script lang="ts">
	import { Editor, ExoEditor, type ExoData, type IExoModule } from '@exomatique_editor/base';
	import { GraphModule } from '@exomatique_editor/graph';
	import { LatexModule } from '@exomatique_editor/latex';
	import { MdModule } from '@exomatique_editor/md';
	import { SemanticModule, type SemanticVariant } from '@exomatique_editor/semantic';

	let {
		data = $bindable(),
		editable = $bindable(false),
		extra_modules = [],
		provideContext = () => {}
	}: {
		data: ExoData;
		editable?: boolean;
		extra_modules?: IExoModule<any>[];
		provideContext?: (editor: ExoEditor) => void;
	} = $props();

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
		modules: extra_modules.concat([
			new MdModule(),
			new SemanticModule(variants),
			new LatexModule(),
			new GraphModule()
		]),
		default_module: 'md'
	});

	provideContext(exo_editor);
</script>

{#key editable}
	<Editor {exo_editor} {editable} bind:data />
{/key}
