import { browser } from '$app/environment';
import * as m from '$lib/paraglide/messages.js';

export async function post(url: string, body?: any): Promise<any> {
	if (!url.startsWith('/')) throw new Error('Should not use utils if using relative api link');
	url = url.substring(1);
	return await new Promise(async (resolve, reject) => {
		try {
			fetch('/api/' + url, {
				method: 'POST',
				body: body ? JSON.stringify(body) : undefined,
				headers: {
					'content-type': 'application/json'
				}
			})
				.then(async (v) => {
					if (!v.ok) reject(v);
					return await v.json();
				})
				.then(resolve)
				.catch(reject);
		} catch (error) {
			reject(error);
		}
	});
}

export async function get(url: string, body?: any): Promise<any> {
	if (!url.startsWith('/')) throw new Error('Should not use utils if using relative api link');
	url = url.substring(1);

	const params = body ? '?' + new URLSearchParams(body).toString() : '';
	return await new Promise(async (resolve, reject) => {
		try {
			fetch('/api/' + url + params, {
				method: 'GET',
				headers: {
					'content-type': 'application/json'
				}
			})
				.then(async (v) => {
					if (!v.ok) reject(v);
					return await v.json();
				})
				.then(resolve)
				.catch(reject);
		} catch (error) {
			reject(error);
		}
	});
}

export async function lang(id: string, lang?: string) {
	const value = (m as any)[id];
	if (value) return value() as string;
	else if (!value && browser) return await get('/lang', { id }).then((v) => v.message as string);
	else return undefined;
}
