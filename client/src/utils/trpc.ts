import { createTRPCReact } from '@trpc/react-query';
import { AppRouter } from '../../../server/src/router';

export const trpc = createTRPCReact<AppRouter>();
