<script lang="ts">
	import { mapNumberToVisiblity, type DocumentMeta } from '$lib/document';
	import { get } from '$lib/utils';
	import { writable } from 'svelte/store';
	import { user } from '../../store';
	import Loading from '../../components/Loading.svelte';
	import { onMount } from 'svelte';
	import VisibilityBadge from '../../components/document/VisibilityBadge.svelte';
	import { Eye, Pen } from '@lucide/svelte';
	import { getRootAddress } from '$lib/file/distant_fs';
	import { href } from '$lib/page/links';

	let data: DocumentMeta[] | undefined = $state(undefined);

	onMount(() => {
		get('/document/query', { author: $user.id }).then((v) => {
			data = (v.data as any[])
				.map(
					(v): DocumentMeta => ({
						...v,
						url: 'index.page',
						created: new Date(v.created),
						updated: new Date(v.updated)
					})
				)
				.sort((v1, v2) => v2.updated.getTime() - v1.updated.getTime());
		});
	});
</script>

<div class="bg-surface-800 m-4 flex flex-1 rounded-sm">
	{#if data}
		<table class="table">
			<thead>
				<tr>
					<th scope="col">Title</th>
					<th scope="col">Id</th>
					<th scope="col">Visibility</th>
					<th scope="col">Created</th>
					<th scope="col">Updated</th>
					<th scope="col">Edit</th>
					<th scope="col">View</th>
				</tr>
			</thead>
			<tbody>
				{#each data as document}
					<tr>
						<td>{document.title}</td>
						<td>{document.id}</td>
						<td>
							<VisibilityBadge
								value={mapNumberToVisiblity(Number.parseInt(document.visibility))}
							/></td
						>

						<td
							>{document.created.toLocaleDateString(undefined, {
								hour: 'numeric'
							})}</td
						>

						<td
							>{document.updated.toLocaleDateString(undefined, {
								hour: 'numeric'
							})}</td
						>

						<td>
							<a
								class="btn bg-surface-700 border-surface-500 self-start border-1"
								href={href(getRootAddress(document.id), true)}
								target="_blank"
							>
								<Pen />
							</a>
						</td>

						<td>
							<a
								class="btn bg-surface-700 border-surface-500 self-end border-1"
								href={href(getRootAddress(document.id))}
								target="_blank"
							>
								<Eye />
							</a>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{:else}
		<div class="flex flex-1 justify-center">
			<Loading size={'extra-large'} />
		</div>
	{/if}
</div>
