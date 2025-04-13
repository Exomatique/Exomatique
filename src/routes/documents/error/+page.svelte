<script>
	import Icon from '../../../components/Icon.svelte';
	import * as m from '$lib/paraglide/messages.js';
</script>

<div class="flex h-full w-full flex-1 items-center justify-center">
	<div class="flex flex-col items-center rounded-2xl border-2 border-red-400 p-5">
		<Icon size={'small'} />

		<div class="mt-2 text-lg">
			<p class="text-wrap">{m.document_error_message()}</p>

			<p class="mt-5">{m.document_error_common_issues()}</p>
			<ul class="ml-5 list-disc">
				<li>{m.document_error_issue_0()}</li>
				<li>{m.document_error_issue_1()}</li>
				<li>{m.document_error_issue_2()}</li>
			</ul>
		</div>
	</div>
</div>
