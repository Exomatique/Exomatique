import type { File, FileAddress, FileType, FileData, FileMeta } from '$lib/file/types';
import { create_client, cwd, sftp_connect } from '../client';

function getFilePath(address: FileAddress): string {
	let path = address.path;
	if (path.startsWith('/')) {
		path = path.substring(1);
	}
	return `${address.document_id}/${path}`;
}

function isFileHidden(address: FileAddress): boolean {
	let path = getFilePath(address);
	path = path.substring(0, path.indexOf('/'));

	const file_name = path.includes('/') ? path.substring(path.lastIndexOf('/') + 1) : path;

	if (path.endsWith('.meta')) return true;

	return file_name.startsWith('.') || file_name.startsWith('__');
}

export async function getMeta(address: FileAddress): Promise<FileMeta | undefined> {
	if (isFileHidden(address)) {
		return undefined;
	}
	const client = create_client();

	const file_path = getFilePath(address) + '.meta';
	return client
		.connect(sftp_connect)
		.then(async () => {
			const data = await client.get(cwd + '/' + file_path);
			if (!data) {
				return undefined;
			}
			const file: FileMeta = JSON.parse(data.toString());
			client.end();
			return file;
		})
		.catch((err) => {
			console.error('Error reading file:', err);
			return undefined;
		});
}

export async function setMeta(address: FileAddress, meta: FileMeta): Promise<FileMeta | undefined> {
	if (isFileHidden(address)) {
		return undefined;
	}

	let real_meta: FileMeta | undefined = undefined;

	getMeta(address).then((old_meta) => {
		if (!old_meta) {
			real_meta = {
				...meta,
				created: new Date(),
				updated: new Date()
			};
		}

		if (meta.type !== old_meta?.type) {
			throw new Error('File type mismatch');
		}

		if (meta.created !== old_meta?.created) {
			throw new Error('File created date mismatch');
		}

		if (meta.address !== old_meta?.address) {
			throw new Error('File address mismatch');
		}
	});

	if (!real_meta) {
		return undefined;
	}

	const client = create_client();
	const file_path = getFilePath(address) + '.meta';

	return client
		.connect(sftp_connect)
		.then(async () => {
			await client.put(Buffer.from(JSON.stringify(real_meta)), cwd + '/' + file_path);
			client.end();
			return real_meta;
		})
		.catch((err) => {
			console.error('Error writing file:', err);
			return undefined;
		});
}

export async function read(address: FileAddress): Promise<File | undefined> {
	return getMeta(address).then((meta) => {
		if (meta === undefined) {
			return undefined;
		}

		switch (meta.type) {
			case 'json': {
				const client = create_client();

				const file_path = getFilePath(address);
				return client
					.connect(sftp_connect)
					.then(async () => {
						const data = await client.get(cwd + '/' + file_path);
						if (!data) {
							return undefined;
						}
						const file: File = {
							...meta,
							data: JSON.parse(data.toString())
						};
						client.end();
						return file;
					})
					.catch((err) => {
						console.error('Error reading file:', err);
						return undefined;
					});
			}

			case 'directory': {
				const client = create_client();
				const file_path = getFilePath(address);
				return client
					.connect(sftp_connect)
					.then(async () => {
						const data = await client.list(cwd + '/' + file_path);

						const children = await Promise.all(
							data
								.filter((file) => file.name.endsWith('.meta'))
								.map(async (file) => {
									const file_path = getFilePath({
										document_id: address.document_id,
										path: address.path + '/' + file.name
									});
									const data = await client.get(cwd + '/' + file_path);
									if (!data) {
										return undefined;
									}
									const child: FileMeta = JSON.parse(data.toString());
									return child;
								})
						);

						const file: File = {
							...meta,
							type: 'directory',
							data: children
						};
						client.end();
						return file;
					})
					.catch((err) => {
						console.error('Error reading file:', err);
						return undefined;
					});
			}
			default:
				throw new Error('Invalid file type');
		}
	});
}

export async function write(
	address: FileAddress,
	type: FileType,
	data: FileData
): Promise<File | undefined> {
	if (isFileHidden(address)) {
		return undefined;
	}

	getMeta(address).then((meta) => {
		if (!meta) {
			meta = {
				address,
				type,
				created: new Date(),
				updated: new Date()
			};
		}

		const file_path = getFilePath(address);

		switch (type) {
			case 'json': {
				if (typeof data !== 'object' && typeof data !== 'string') {
					throw new Error('Invalid data type for JSON file');
				}

				if (typeof data === 'object') {
					data = JSON.stringify(data);
				}

				const client = create_client();

				return client
					.connect(sftp_connect)
					.then(async () => {
						await client.put(Buffer.from(data), cwd + '/' + file_path);
						client.end();
						const file: File = {
							...meta,
							updated: new Date(),
							type: 'json',
							data: data
						};
						await setMeta(address, file);
						return file;
					})
					.catch((err) => {
						console.error('Error writing file:', err);
						return undefined;
					});
			}

			case 'directory':
				if (!Array.isArray(data) || data.filter((v) => !(v satisfies FileMeta)).length !== 0) {
					throw new Error('Invalid data type for directory file');
				}

				const client = create_client();
				return client
					.connect(sftp_connect)
					.then(async () => {
						await client.mkdir(cwd + '/' + file_path, true);
						await Promise.all(
							data.map(async (child: FileMeta) => {
								const file_path = getFilePath(child.address);
								await client.put(
									Buffer.from(JSON.stringify(child)),
									cwd + '/' + file_path + '.meta'
								);
								await client.put(Buffer.from(JSON.stringify(child)), cwd + '/' + file_path);
							})
						);
						client.end();
						const file: File = {
							...meta,
							updated: new Date(),
							type: 'directory',
							data
						};
						await setMeta(address, file);
						return file;
					})
					.catch((err) => {
						console.error('Error writing file:', err);
						return undefined;
					});
			default:
				throw new Error('Invalid file type');
		}
	});
}

export async function remove(address: FileAddress): Promise<boolean | undefined> {
	if (isFileHidden(address)) {
		return undefined;
	}

	getMeta(address).then((meta) => {
		if (!meta) {
			return undefined;
		}
		const file_path = getFilePath(address);

		const client = create_client();
		return client
			.connect(sftp_connect)
			.then(async () => {
				const file_path = getFilePath(address);

				if (meta.type === 'directory') {
					await client.rmdir(cwd + '/' + file_path, true);
				} else {
					await client.delete(cwd + '/' + file_path);
				}
				await client.delete(cwd + '/' + file_path + '.meta');
				client.end();
				return true;
			})
			.catch((err) => {
				console.error('Error deleting file:', err);
				return false;
			});
	});
}
