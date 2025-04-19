import type { Document } from '@prisma/client';
import { Readable } from 'stream';
import { create_client, cwd, prisma, sftp_connect } from '../client';
import initializeDocument from '$lib/document/initializer';

export async function create(authorId: string): Promise<Document> {
	const doc = await prisma.document.create({ data: { authorId } });

	const client = create_client();
	await client.connect(sftp_connect).then(() => {
		return client.mkdir(cwd + '/' + doc.id);
	});

	await initializeDocument(doc.id);

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

export async function list_files(docId: string, path: string): Promise<string[] | undefined> {
	const client = create_client();

	return client.connect(sftp_connect).then(async () => {
		return client
			.list(cwd + '/' + docId + '/' + path)
			.then((v) => v.map((v) => v.name))
			.catch(() => undefined);
	});
}

export async function mkdir(docId: string, path: string): Promise<string | undefined> {
	const client = create_client();

	return client.connect(sftp_connect).then(async () => {
		return client.mkdir(cwd + '/' + docId + '/' + path, true).catch(() => undefined);
	});
}
