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
		research: boolean;
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
		rememberme: false,
		research: true
	} satisfies RegisterData);

	let agreeToDocumentPermission = $state(false);

	data.subscribe(() => ($error = undefined));
</script>

<div
	class="block w-fit rounded-lg p-1.5"
	style="background: linear-gradient(to left, #4433ff, #ff44dd);"
>
	<form class="bg-surface-800 flex flex-col gap-6 rounded-lg p-6" method="POST" use:enhance>
		<!-- Logo/Icon -->
		<div class="self-center">
			<Icon />
		</div>

		<!-- Error message -->
		{#if $error}
			<p class="text-error-800 text-center text-sm">{(m as any)[$error]()}</p>
		{:else}
			<p class="invisible text-center text-sm">{m.fail()}</p>
		{/if}

		<!-- Username -->
		<div>
			<label for="username" class="mb-1 block text-sm font-medium">
				{m.username()}
			</label>
			<input
				id="username"
				name="username"
				class="bg-surface-900 w-full rounded px-3 py-2 outline-none"
				bind:value={$data.username}
			/>
		</div>

		<!-- Password -->
		<div>
			<label for="password_create" class="mb-1 block text-sm font-medium">
				{m.password()}
			</label>
			<input
				id="password_create"
				type="password"
				name="password_create"
				class="bg-surface-900 w-full rounded px-3 py-2 outline-none"
				bind:value={$data.password}
			/>
		</div>

		<!-- Password Again -->
		<div>
			<label for="password_again" class="mb-1 block text-sm font-medium">
				{m.password_again()}
			</label>
			<input
				id="password_again"
				type="password"
				name="password_again"
				class="bg-surface-900 w-full rounded px-3 py-2 outline-none"
				bind:value={$data.password_again}
			/>
		</div>

		<!-- Remember Me -->
		<div class="flex items-center space-x-2">
			<input
				id="remember"
				type="checkbox"
				name="remember"
				class="h-5 w-5 rounded border-gray-300"
				bind:checked={$data.rememberme}
			/>
			<label for="remember" class="text-sm">
				{m.rememberme()}
			</label>
		</div>

		<!-- Agreements -->
		<div class="space-y-3">
			<div class="flex items-start space-x-3">
				<input
					id="document-permission"
					type="checkbox"
					class="mt-1 h-5 w-5 rounded border-gray-300"
					bind:checked={agreeToDocumentPermission}
				/>
				<label for="document-permission" class="text-sm leading-6">
					<span class="text-red-500">*</span>
					{m.register_document_licence()}
				</label>
			</div>

			<div class="flex items-start space-x-3">
				<input
					id="research-participation"
					type="checkbox"
					class="mt-1 h-5 w-5 rounded border-gray-300"
					bind:checked={$data.research}
				/>
				<label for="research-participation" class="text-sm leading-6">
					{m.register_research()}
				</label>
			</div>
		</div>

		<!-- Submit Button -->
		<div class="pt-4">
			{#if $loading}
				<button class="btn bg-primary-800 w-full" disabled>
					<Loading />
				</button>
			{:else}
				<button
					class="btn bg-primary-800 w-full disabled:cursor-not-allowed disabled:opacity-50"
					disabled={$data.password !== $data.password_again || !agreeToDocumentPermission}
					onclick={async () => {
						$loading = true;
						$error = undefined;
						$error = await onRegister($data);
						$loading = false;
					}}
				>
					{m.register()}
				</button>
			{/if}
		</div>
	</form>
</div>
