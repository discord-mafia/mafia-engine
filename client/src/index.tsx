import React from 'react';
import ReactDOM from 'react-dom/client';
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SuperJSON from 'superjson';
import HomePage from './pages/home';
import { trpc } from './utils/trpc';

import './styles/index.css';
import { httpBatchLink } from '@trpc/react-query';

function App() {
	const [queryClient] = useState(() => new QueryClient());
	const [trpcClient] = useState(() =>
		trpc.createClient({
			transformer: SuperJSON,
			links: [
				httpBatchLink({
					url: process.env.TRPC_URL ?? 'http://localhost:3000/api/trpc',
					async headers() {
						return {
							// authorization: getAuthCookie(),
						};
					},
				}),
			],
		})
	);

	return (
		<>
			<trpc.Provider client={trpcClient} queryClient={queryClient}>
				<QueryClientProvider client={queryClient}>
					<HomePage />
				</QueryClientProvider>
			</trpc.Provider>
		</>
	);
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
);
