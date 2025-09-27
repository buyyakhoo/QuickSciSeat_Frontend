// import type { LayoutServerLoad } from './$types';
 
export const load = async (event: { locals: { auth: () => any; }; }) => {
    return {
        session: await event.locals.auth()
    };
};