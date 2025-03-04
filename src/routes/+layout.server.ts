import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async (event): Promise<{ user?: { id: string, name: string } }> => {
    if (!event.locals.user) {
        return {}
    }
    return { user: event.locals.user };
};