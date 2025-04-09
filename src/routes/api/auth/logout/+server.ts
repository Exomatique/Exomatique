import { error, json, type RequestHandler } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';

export const POST: RequestHandler = async (event) => {
	if (!event.locals.session) {
		return error(401);
	}
	await auth.invalidateSession(event.locals.session.id);
	auth.deleteSessionTokenCookie(event);

	return json({ ok: 1 });
};
