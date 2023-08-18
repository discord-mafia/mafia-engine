import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import SuperJSON from 'superjson';
import { Home } from './pages/home';
import { trpc } from './utils/trpc';
import './App.css';

function App() {
	const [queryClient] = useState(() => new QueryClient());
	const [trpcClient] = useState(() =>
		trpc.createClient({
			transformer: SuperJSON,

			links: [
				httpBatchLink({
					url: 'http://localhost:4000/trpc',
					// You can pass any HTTP headers you wish here
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
					<Home />
				</QueryClientProvider>
			</trpc.Provider>
		</>
	);
}

export default App;
