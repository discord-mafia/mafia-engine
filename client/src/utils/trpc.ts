import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '../../../src/router';
export const trpc = createTRPCReact<AppRouter>();
