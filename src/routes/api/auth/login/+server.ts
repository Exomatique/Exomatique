import { validatePassword, validateUsername } from "$lib/server/auth";
import { prisma } from "$lib/server/client";
import { verify } from "@node-rs/argon2";
import * as auth from '$lib/server/auth';
import { error, json, redirect, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async (event) => {
    const data = await event.request.json();
    const username = data.username;
    const password = data.password;
    const rememberme: boolean = data.rememberme === 'true';

    const existingUser = await prisma.user.findFirst({ where: { name: username } });

    if (!existingUser) {
        error(400, { message: 'loginattempt_fail' });
    }

    const validPassword = await verify(existingUser.passwordHash, password, {
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1
    });
    if (!validPassword) {
        error(400, { message: 'loginattempt_fail' });
    }

    const sessionToken = auth.generateSessionToken();
    const session = await auth.createSession(sessionToken, existingUser.id, rememberme);
    auth.setSessionTokenCookie(event, sessionToken, rememberme ? session.expiresAt : undefined);
    return json({ "ok": 1 });
}