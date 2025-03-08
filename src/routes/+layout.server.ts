import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async (event): Promise<any> => {
    if (event.url.pathname.startsWith('/api/')) return;
    if (!event.locals.user) {
        return {}
    }
    return { user: event.locals.user };
};