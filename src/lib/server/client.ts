import { PrismaClient } from '@prisma/client'
import { SFTP } from '$env/static/private';
import Client from "ssh2-sftp-client";

export const prisma = new PrismaClient()

export const sftp_connect: Client.ConnectOptions = JSON.parse(SFTP)
export const cwd = "/upload"
export const create_client = () => (new Client());