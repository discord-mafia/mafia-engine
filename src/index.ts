import { PrismaClient } from '@prisma/client';
import { startDiscordBot } from '@controllers/botController';
import { startApiServer } from '@controllers/apiController';

export const prisma = new PrismaClient();

startDiscordBot();
startApiServer();
