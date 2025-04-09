import type { Document } from '@prisma/client';
import { Readable, Writable } from 'stream';
import { create_client, cwd, prisma, sftp_connect } from '../client';

export async function create(authorId: string): Promise<Document> {
	const doc = await prisma.document.create({ data: { authorId } });

	const client = create_client();
	await client.connect(sftp_connect).then(() => {
		return client.mkdir(cwd + '/' + doc.id);
	});

	return doc;
}

export async function write(docId: string, path: string, data: string): Promise<string> {
	const client = create_client();

	return client.connect(sftp_connect).then(() => {
		return client.put(Readable.from([data]), cwd + '/' + docId + '/' + path);
	});
}

export async function read(docId: string, path: string): Promise<string | undefined> {
	const client = create_client();

	return client.connect(sftp_connect).then(async () => {
		return client
			.get(cwd + '/' + docId + '/' + path)
			.then((v) => v.toString())
			.catch(() => undefined);
	});
}
