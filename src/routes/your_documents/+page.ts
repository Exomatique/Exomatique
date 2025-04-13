import { redirect } from '@sveltejs/kit';

export const load = async (e) => {
	const data = await e.parent();
	if (!data['user']) return redirect(302, '/');
};
