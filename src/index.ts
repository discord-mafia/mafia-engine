import { PrismaClient } from '@prisma/client';
import { startDiscordBot } from '@controllers/botController';

export const prisma = new PrismaClient();

startDiscordBot();
