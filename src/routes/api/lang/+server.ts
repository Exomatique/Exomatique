import type { RequestHandler } from "@sveltejs/kit";
import * as auth from '$lib/server/auth';
import { json } from "@sveltejs/kit";
import { error } from "@sveltejs/kit";
import { create, read, write } from "$lib/server/file";
import { prisma } from "$lib/server/client";

export const GET: RequestHandler = async (event) => {
    const token = event.cookies.get(auth.sessionCookieName);

    if (!token) {
        error(400, { message: 'account_needed_fail' });
    }

    const user = await auth.validateSessionToken(token).then(v => v.user);

    if (!user) {
        error(400, { message: 'account_needed_fail' });
    }

    const id = event.url.searchParams.get("id");
    const lang = event.cookies.get("paraglide_lang") || "en";

    if (!id) {
        error(400, { message: 'missing_required_params_fail' })
    }

    const message = (await prisma.editableLang.findFirst({ where: { id, lang } }))?.value || id

    return json({ ok: 1, message });
}

export const POST: RequestHandler = async (event) => {
    return json({ ok: 1 });
}