<script lang="ts">
	import { enhance } from '$app/forms';
	import * as m from '$lib/paraglide/messages.js';
	import { writable, type Writable } from 'svelte/store';
	import Icon from '../Icon.svelte';
	import Loading from '../Loading.svelte';

	export interface RegisterData {
		username: string;
		password: string;
		password_again: string;
		rememberme: boolean;
	}

	interface Props {
		onRegister: (data: RegisterData) => Promise<string | undefined>;
	}

	const {
		onRegister = async (): Promise<string | undefined> => {
			return undefined;
		}
	}: Props = $props();

	let error: Writable<string | undefined> = writable(undefined);
	let loading = writable(false);
	let data = writable({
		username: '',
		password: '',
		password_again: '',
		rememberme: false
	} as RegisterData);

	data.subscribe(() => ($error = undefined));
</script>

<div
	class={'block w-fit rounded-lg p-1.5'}
	style="background: linear-gradient(to left, #4433ffff, #ff44ddff);"
>
	<form class="bg-surface-800 flex flex-col gap-5 rounded-lg p-5" method="POST" use:enhance>
		<div class="self-center">
			<Icon />
		</div>

		{#if $error}
			<div class="text-error-800">{(m as any)[$error]()}</div>
		{:else}
			<div class="invisible">{m.fail()}</div>
		{/if}

		<label>
			{m.username()} : <br />
			<input class="bg-surface-900 px-2 outline-none" name="username" bind:value={$data.username} />
		</label>

		<label>
			{m.password()} : <br />
			<input
				class="bg-surface-900 px-2 outline-none"
				type="password"
				name="password_create"
				bind:value={$data.password}
			/>
		</label>

		<label>
			{m.password_again()} : <br />
			<input
				class="bg-surface-900 px-2 outline-none"
				type="password"
				name="password_again"
				bind:value={$data.password_again}
			/>
		</label>

		<label>
			{m.rememberme()} :
			<input
				class="bg-surface-900 px-2 outline-none"
				type="checkbox"
				name="remember"
				bind:checked={$data.rememberme}
			/>
		</label>
		{#if $loading}
			<button class="btn bg-primary-800" disabled><Loading /></button>
		{:else}
			<button
				disabled={$data.password !== $data.password_again}
				class="btn bg-primary-800"
				onclick={async () => {
					$loading = true;
					$error = undefined;
					$error = await onRegister($data);
					$loading = false;
				}}>{m.register()}</button
			>
		{/if}
	</form>
</div>
