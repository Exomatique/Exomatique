<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { i18n } from '$lib/i18n';
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import '../app.css';
	import Header from '../components/Header.svelte';
	import type { PageServerData } from './$types';
	import type { Snippet } from 'svelte';
	import LoginBox from '../components/auth/LoginBox.svelte';
	import RegisterBox from '../components/auth/RegisterBox.svelte';
	import { post } from '$lib/utils';
	import { page } from '$app/state';
	let { children, data }: { children: Snippet<[]>; data: PageServerData } = $props();

	let routes = [
		{ value: '', text: () => m.home() },
		{ value: 'exercises', text: () => m.exercises() }
	];

	let open_login = $state(false);
	let open_register = $state(false);

	let selected_route = $state(((page.route.id || '/').substring(1) + '/').split('/')[0]);
</script>

<div
	class="flex h-dvh grow flex-col"
	role="none"
	tabindex="-1"
	onkeydown={(e) => {
		if (e.key === 'Escape') {
			open_login = false;
			open_register = false;
		}
	}}
>
	<ParaglideJS {i18n}>
		<Header
			user={data.user ? { name: data?.user?.name } : undefined}
			pages={routes.map((v) => {
				return { value: v.value, text: v.text() };
			})}
			bind:selected={selected_route}
			onLogin={() => {
				open_register = false;
				open_login = true;
			}}
			onLogout={async () => {
				await post('/auth/logout', data);
				location.reload();
			}}
			onRegister={() => {
				open_login = false;
				open_register = true;
			}}
		/>

		<div class="relative flex-1">
			{@render children()}
		</div>
	</ParaglideJS>
	<ParaglideJS {i18n}>
		{#if open_login || open_register}
			<div class="absolute top-0 flex h-full w-full items-center justify-center">
				<div class="h-full w-full bg-black opacity-95"></div>
				<div class="bg-surface-300 absolute top-0 right-0">
					<button
						class="button p-2"
						onclick={() => {
							open_login = false;
							open_register = false;
						}}>x</button
					>
				</div>

				<div class="absolute">
					{#if open_login}
						<LoginBox
							onLogin={async (data) => {
								const isOk = (await post('/auth/login', data)).ok === 1;
								if (isOk) location.reload();
								return isOk;
							}}
						/>
					{/if}

					{#if open_register}
						<RegisterBox
							onRegister={async (data) => {
								const result = await post('/auth/register', data);
								const isOk = result.ok === 1;
								if (isOk) location.reload();
								return isOk ? undefined : result.message;
							}}
						/>
					{/if}
				</div>
			</div>
		{/if}
	</ParaglideJS>
</div>
