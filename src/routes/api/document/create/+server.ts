import Client from "ssh2-sftp-client";
import { prisma, sftp_connect } from "$lib/server/client";
import type { RequestHandler } from "@sveltejs/kit";
import * as auth from '$lib/server/auth';
import { json } from "@sveltejs/kit";
import { error } from "@sveltejs/kit";
import { create } from "$lib/server/file";

export const POST: RequestHandler = async (event) => {
    const token = event.cookies.get(auth.sessionCookieName);

    if (!token) {
        error(400, { message: 'account_needed_fail' });
    }

    const user = await auth.validateSessionToken(token).then(v => v.user)

    if (!user) {
        error(400, { message: 'account_needed_fail' });
    }

    const document = create(user.id);

    return json({ ok: 1, document });
}