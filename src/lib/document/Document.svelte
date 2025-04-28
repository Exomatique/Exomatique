<script lang="ts">
	import { goto } from '$app/navigation';
	import Editor from '$lib/document/Editor.svelte';
	import { get } from '$lib/utils';
	import { onMount } from 'svelte';
	import { default_icon, type DocumentMeta } from '$lib/document';
	import type { ExoData } from '@exomatique_editor/base';
	import { getRootAddress, read } from '$lib/file/distant_fs';
	import type { FileAddress, PageFile } from '$lib/file/types';
	import { href } from '$lib/page/links';
	import { resolvePageAddress } from '$lib/utils/link';
	import NavigationModule from '$lib/editor/navigation/NavigationModule';
	import fileLinkExtension from '$lib/editor/markdown/FileLinkExtension';
	import { MdModule } from '@exomatique_editor/md';
	import Loading from '../../components/Loading.svelte';
	import { user } from '../../store';
	import type { IconMeta } from '$lib/types';
	import Icon from '../../components/Icon.svelte';
	import DocumentIcon from '../../components/document/DocumentIcon.svelte';

	/** @type {import('./$types').PageProps} */
	let {
		address = $bindable(),
		document_map,
		page_map
	}: {
		address: FileAddress;
		document_map: Map<string, DocumentMeta>;
		page_map: Map<string, PageFile>;
	} = $props();

	let _document: DocumentMeta | undefined = $state(undefined);
	let data: ExoData | undefined = $state(undefined);
	let real_address = $derived.by(() => resolvePageAddress(address));
	let title = $state('');
	let icon: IconMeta | undefined = $state(undefined);

	function updateAState() {
		Array(...document.getElementsByTagName('a'))
			.filter((v) => contentPane.contains(v))
			.forEach((v) => {
				v.onclick = onMarkdownClick;
			});
	}

	function query(address: FileAddress, setcurrent?: boolean) {
		const cached_document = document_map.get(address.document_id);
		if (cached_document) {
			if (setcurrent) {
				_document = cached_document;
				setTimeout(updateAState, 20);
			}
		} else
			get('/document', { document_id: address.document_id })
				.then((v) => {
					if (setcurrent) _document = v.meta as DocumentMeta;
					document_map.set(v.meta.id, v.meta);
				})
				.catch((e) => {
					if (setcurrent) goto('/documents/error');
				});

		const cache_page = page_map.get(address.document_id + '/' + address.path);
		if (cache_page) {
			if (setcurrent) {
				data = cache_page.data.content;
				title = cache_page.data.title;
				icon = cache_page.data.icon || default_icon;
				setTimeout(updateAState, 20);
			}
		} else
			read({ ...resolvePageAddress(address) }, 'page').then((v) => {
				if (!v || !(v as any satisfies PageFile)) {
					if (setcurrent) goto('/documents/error');
					return;
				}
				let page = v as PageFile;

				if (page) {
					if (setcurrent) {
						data = page.data.content;
						title = page.data.title;
						setTimeout(updateAState, 20);
					}
					page_map.set(address.document_id + '/' + address.path, page);
				}
			});
	}

	async function onMarkdownClick(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (target?.tagName === 'A') {
			const href = (target as HTMLAnchorElement).getAttribute('href');
			if (href && href.startsWith('/')) {
				event.preventDefault();
				await goto(href);
			}
		}
	}
	let contentPane: HTMLElement;

	onMount(() => {
		query(real_address, true);
	});

	$effect(() => {
		query(real_address, true);
	});
</script>

<svelte:head>
	<title>Viewing : {title} IN {_document?.title || ''}</title>
</svelte:head>

<div class="relative flex h-full flex-1 justify-center">
	<div
		bind:this={contentPane}
		tabindex="-1"
		class="absolute w-3/4 grow flex-row bg-white text-neutral-950 scheme-light"
	>
		{#if data}
			<div class="flex w-full grow items-center justify-center px-5 py-2">
				<div class="flex flex-row items-center gap-5 select-none">
					<div class="flex flex-row items-center gap-2">
						<DocumentIcon icon={_document?.icon || default_icon} size={32} />
						<h4 class="h5 h-fit align-text-bottom text-nowrap">{_document?.title || ''}</h4>
					</div>
					<h4 class="h5 text-end text-nowrap">/</h4>
					<div class="text-surface-400 flex flex-row items-center gap-2">
						<DocumentIcon icon={icon || default_icon} size={32} />
						<h5 class="h5 text-nowrap">{title}</h5>
					</div>
				</div>
				<div class="flex grow"></div>
				{#if _document && _document.authorId === $user?.id}
					<a
						class="btn bg-surface-200 hover:bg-surface-400 h-fit w-fit self-end"
						href={href(real_address, true)}>Edit</a
					>
				{/if}
			</div>
			<Editor
				bind:data
				extra_modules={[new NavigationModule()]}
				provideContext={(editor) => {
					editor.addContext('root', getRootAddress(address.document_id));
					editor.addContext('resolver', (v: FileAddress) => href(v, false));

					const MdModule = editor.modules['md'] as MdModule;

					MdModule.extra_plugins.push({
						type: 'remark',
						plugin: () =>
							fileLinkExtension((v: string) => {
								const thisAddress = {
									document_id: address.document_id,
									path: v
								};
								query(thisAddress);
								return href(thisAddress, false);
							})
					});
				}}
			/>
		{:else}
			<div class=" pr-2 pb-2">
				<div class="flex w-full grow justify-center shadow-2xl">
					<Loading size={'extra-large'} />
				</div>
			</div>
		{/if}
	</div>
</div>
