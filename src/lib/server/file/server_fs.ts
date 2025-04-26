import {
	getChildAddress,
	getFileName,
	getFilePath,
	isDirAddress,
	isFileHidden
} from '$lib/file/distant_fs';
import {
	type File,
	type FileAddress,
	type FileType,
	type FileData,
	type FileMeta,
	doesFileDataTypeMatchType
} from '$lib/file/types';
import type sftp from 'ssh2-sftp-client';
import { cwd, prisma, sftp_connect, create_client } from '../client';
import { Mutex } from 'async-mutex';

let client: sftp | undefined = undefined;
let connected = false;
let connection_mutex = new Mutex();
export async function getClient() {
	return connection_mutex.runExclusive(async () => {
		if (!client || !connected || !(client as any).sftp) {
			client = create_client();
			await client.connect(sftp_connect);
			connected = true;
		}
		return client;
	});
}

export async function getMeta(address: FileAddress): Promise<FileMeta | undefined> {
	if (isFileHidden(address)) {
		return undefined;
	}

	const path = getFilePath(address);

	const client = await getClient();

	const file_path = path + '.meta';
	const meta_name = await getFileName({ document_id: address.document_id, path: file_path });

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
	return {
		created: new Date(file.created),
		updated: new Date(file.updated),
		address: file.address,
		type: file.type,
		extra: file.extra
	};
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
	const client = await getClient();
	const file_path = getFilePath(address) + '.meta';

	await client.put(Buffer.from(JSON.stringify(real_meta)), cwd + '/' + file_path);
	return real_meta;
}

export async function read(address: FileAddress): Promise<File | undefined> {
	return getMeta(address).then(async (meta) => {
		if (meta === undefined) {
			return undefined;
		}

		if (!(meta.type as any satisfies FileType)) throw new Error('Invalid file type');

		if (meta.type === 'directory') {
			const client = await getClient();
			const file_path = getFilePath(address);

			const files = await client.list(cwd + '/' + file_path);

			const children = files
				.filter((file) => !isFileHidden(getChildAddress(address, file.name)))
				.map((file) => file.name);

			children.sort((a, b) => {
				let i_a = a.includes('.') ? -1 : 1;
				let i_b = b.includes('.') ? -1 : 1;

				return i_a === i_b ? a.localeCompare(b) : i_b - i_a;
			});

			const file: File = {
				...meta,
				type: 'directory',
				data: children
			};
			return file;
		}

		const client = await getClient();

		const file_path = getFilePath(address);

		const time = new Date().getTime();

		const data = await client.get(cwd + '/' + file_path);
		if (!data) {
			return undefined;
		}
		const file: File = {
			...meta,
			data: JSON.parse(data.toString())
		};
		return file;
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

	return getMeta(address).then(async (meta) => {
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

			const client = await getClient();
			await client.mkdir(cwd + '/' + file_path, true);
			const file: File = {
				...meta,
				updated: new Date(),
				type: 'directory',
				data
			};
			await setMeta(address, file);
			return file;
		}

		if (typeof data !== 'object' && typeof data !== 'string') {
			throw new Error('Invalid data type for JSON file');
		}

		const client = await getClient();

		await client.put(
			Buffer.from(typeof data === 'object' ? JSON.stringify(data) : data),
			cwd + '/' + file_path
		);
		const file: File = {
			...meta,
			updated: new Date(),
			type: type,
			data: data
		};
		await setMeta(address, file);
		return file;
	});
}

export async function remove(address: FileAddress): Promise<boolean | undefined> {
	if (isFileHidden(address)) {
		return undefined;
	}

	return getMeta(address).then(async (meta) => {
		if (!meta) {
			return undefined;
		}
		const file_path = getFilePath(address);

		const client = await getClient();

		if (meta.type === 'directory') {
			await client.rmdir(cwd + '/' + file_path, true);
		} else {
			await client.delete(cwd + '/' + file_path);
		}
		if (!isDirAddress(address)) await client.delete(cwd + '/' + file_path + '.meta', true);
		return true;
	});
}
