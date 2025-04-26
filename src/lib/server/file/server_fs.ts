import { getChildAddress, getFileName, getFilePath, isFileHidden } from '$lib/file/distant_fs';
import {
	type File,
	type FileAddress,
	type FileType,
	type FileData,
	type FileMeta,
	doesFileDataTypeMatchType
} from '$lib/file/types';
import { create_client, cwd, prisma, sftp_connect } from '../client';

export async function getMeta(address: FileAddress): Promise<FileMeta | undefined> {
	if (isFileHidden(address)) {
		return undefined;
	}

	const path = getFilePath(address);

	const client = create_client();

	const file_path = path + '.meta';
	const meta_name = await getFileName({ document_id: address.document_id, path: file_path });

	return client
		.connect(sftp_connect)
		.then(async (): Promise<FileMeta | undefined> => {
			const data = await client.get(cwd + '/' + file_path).catch((e) => {
				if (meta_name === '.meta') {
					return JSON.stringify({
						address: address,
						type: 'directory',
						created: new Date(),
						updated: new Date()
					});
				} else if (
					meta_name.endsWith('.meta') &&
					meta_name.indexOf('.') !== meta_name.lastIndexOf('.')
				) {
					const type = meta_name.split('.').slice(-2, -1)[0];

					if (type as any satisfies FileType) {
						return JSON.stringify({
							address: address,
							type: type,
							created: new Date(),
							updated: new Date()
						});
					}
				}
				return undefined;
			});
			if (!data) return undefined;
			const file: FileMeta = JSON.parse(data.toString());
			client.end();
			return file;
		})
		.then((file) => {
			if (!file) return undefined;
			return {
				created: new Date(file.created),
				updated: new Date(file.updated),
				address: file.address,
				type: file.type,
				extra: file.extra
			};
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

	let real_meta: FileMeta | undefined = await getMeta(address).then((old_meta) => {
		if (!old_meta) {
			return {
				...meta,
				created: meta.created ?? new Date(),
				updated: meta.updated ?? new Date()
			} as FileMeta;
		}

		if (meta.type !== old_meta?.type) {
			throw new Error('File type mismatch');
		}

		if (JSON.stringify(meta.address) !== JSON.stringify(old_meta?.address)) {
			throw new Error('File address mismatch');
		}

		return {
			...old_meta,
			updated: new Date(),
			extra: meta.extra
		};
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

		if (!(meta.type as any satisfies FileType)) throw new Error('Invalid file type');

		if (meta.type === 'directory') {
			const client = create_client();
			const file_path = getFilePath(address);
			return client
				.connect(sftp_connect)
				.then(async () => {
					const files = await client.list(cwd + '/' + file_path);

					const children = files.filter(
						(file) => !isFileHidden(getChildAddress(address, file.name))
					);
					const file: File = {
						...meta,
						type: 'directory',
						data: children.map((file) => file.name)
					};
					client.end();
					return file;
				})
				.catch((err) => {
					console.error('Error reading file:', err);
					return undefined;
				});
		}

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

	if (!doesFileDataTypeMatchType(type, data)) {
		throw new Error('File data type does not match file type');
	}

	return getMeta(address).then((meta) => {
		if (!meta) {
			meta = {
				address,
				type,
				created: new Date(),
				updated: new Date()
			};
		}

		const file_path = getFilePath(address);

		if (!(meta.type as any satisfies FileType)) throw new Error('Invalid file type');
		if (meta.type !== type) {
			throw new Error('File type mismatch');
		}

		if (meta.type === 'directory') {
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
							await client.put(Buffer.from(JSON.stringify(child)), cwd + '/' + file_path + '.meta');
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
		}

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
					type: type,
					data: data
				};
				await setMeta(address, file);
				return file;
			})
			.catch((err) => {
				console.error('Error writing file:', err);
				return undefined;
			});
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
