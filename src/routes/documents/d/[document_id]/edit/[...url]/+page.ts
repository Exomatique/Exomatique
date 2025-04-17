export const ssr = false;
export const csr = true;

/** @type {import('./$types').PageLoad} */
export function load({ params }: any) {
	console.log(params);
	return { document_id: params.document_id, url: params.url ? params.url + '.json' : 'index.json' };
}
