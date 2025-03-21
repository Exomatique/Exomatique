import { browser } from "$app/environment";
import * as m from '$lib/paraglide/messages.js';

export async function post(url: string, body?: any) {
    if (!url.startsWith("/")) throw new Error("Should not use utils if using relative api link");
    url = url.substring(1)
    return await fetch("/api/" + url, {
        method: "POST",
        body: body ? JSON.stringify(body) : undefined,
        headers: {
            'content-type': 'application/json'
        }
    }).then(async v => await v.json())
}

export async function get(url: string, body?: any) {
    if (!url.startsWith("/")) throw new Error("Should not use utils if using relative api link");
    url = url.substring(1)

    const params = body ? "?" + new URLSearchParams(body).toString() : "";
    return await fetch("/api/" + url + params, {
        method: "GET",
        headers: {
            'content-type': 'application/json'
        }
    }).then(async v => await v.json())
}

export async function lang(id: string, lang?: string) {
    const value = (m as any)[id];
    if (value) return value() as string
    else if (!value && browser) return await get("/lang", { id }).then(v => v.message as string);
    else return undefined
}