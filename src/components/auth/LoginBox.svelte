<script lang="ts">
	import { loginattempt_fail } from './../../lib/paraglide/messages.js';
	import { enhance } from '$app/forms';
	import * as m from '$lib/paraglide/messages.js';
	import { writable } from 'svelte/store';
	import Icon from '../Icon.svelte';
	import Loading from '../Loading.svelte';

	export interface LoginData {
		username: string;
		password: string;
		rememberme: boolean;
	}

	interface Props {
		onLogin: (data: LoginData) => Promise<boolean>;
	}

	const {
		onLogin = async () => {
			return false;
		}
	}: Props = $props();

	let error = writable(false);
	let loading = writable(false);
	let data = writable({ username: '', password: '', rememberme: false } as LoginData);

	data.subscribe(() => ($error = false));
</script>

<div
	class={'block w-fit rounded-lg p-1.5'}
	style="background: linear-gradient(to left, #4433ffff, #ff44ddff);"
>
	<form
		class="bg-surface-800 relative flex flex-col gap-5 rounded-lg p-5"
		method="POST"
		use:enhance
	>
		<div class="self-center">
			<Icon />
		</div>

		{#if $error}
			<div class="text-error-800">{m.loginattempt_fail()}</div>
		{:else}
			<div class="invisible">{m.loginattempt_fail()}</div>
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
				name="password"
				bind:value={$data.password}
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
				class="btn bg-primary-800"
				onclick={async () => {
					$loading = true;
					$error = false;
					$error = !(await onLogin($data));
					$loading = false;
				}}>{m.login()}</button
			>
		{/if}
	</form>
</div>
