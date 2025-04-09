import { validatePassword } from '$lib/server/auth';
import { generateUserId } from '$lib/server/auth';
import { validateUsername } from '$lib/server/auth';
import { prisma } from '$lib/server/client';
import { hash } from '@node-rs/argon2';
import type { RequestHandler } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';
import { json } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';

export const POST: RequestHandler = async (event) => {
	const formData = await event.request.json();
	const username = formData.username;
	const password = formData.password;
	const rememberme = formData.rememberme;

	if (!validateUsername(username)) {
		error(400, {
			message: 'register_username_rules_fail'
		});
	}

	const existingUser = await prisma.user.findFirst({ where: { name: username } });
	if (existingUser) {
		error(400, { message: 'register_username_exist_fail' });
	}

	if (!validatePassword(password)) {
		error(400, { message: 'register_password_rules_fail' });
	}

	const userId = generateUserId();
	const passwordHash = await hash(password, {
		// recommended minimum parameters
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1
	});

	try {
		await prisma.user.create({ data: { id: userId, name: username, passwordHash } });

		const sessionToken = auth.generateSessionToken();
		const session = await auth.createSession(sessionToken, userId, rememberme);
		auth.setSessionTokenCookie(event, sessionToken, rememberme ? session.expiresAt : undefined);
	} catch (e) {
		error(500, { message: 'fail' });
	}
	return json({ ok: 1 });
};
