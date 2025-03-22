import type { User } from '$lib/types';
import { writable } from 'svelte/store';

export let user = writable(undefined as User | undefined);
