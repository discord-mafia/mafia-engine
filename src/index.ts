import { PrismaClient } from '@prisma/client';
import { startApiServer } from './controllers/apiController';
import { startDiscordBot } from './controllers/botController';

export const prisma = new PrismaClient();

startDiscordBot();
startApiServer();
