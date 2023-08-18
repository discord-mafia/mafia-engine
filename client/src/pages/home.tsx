import { useEffect, useState } from 'react';
import { trpc } from '../utils/trpc';

export function Home() {
	const [count, setCount] = useState(0);

	const data = trpc.greeting.useQuery('Test');

	useEffect(() => {
		console.log(data.isLoading, data);
	}, [data.isLoading]);

	return (
		<>
			<h1>Mafia Engine</h1>
			<div className="card">
				<p>Test interactions by clicking the button below</p>
				<button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
				<p>{data.isLoading ? 'Data is loading from server...' : data.data}</p>
			</div>
			<p className="read-the-docs">Click on the Vite and React logos to learn more</p>
		</>
	);
}
