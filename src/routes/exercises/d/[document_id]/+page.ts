export const ssr = false;
export const csr = true;

/** @type {import('./$types').PageLoad} */
export function load({ params }: any) {
    return { document_id: params.document_id };
}