import { useEffect, useState } from 'react';
import { trpc } from '../utils/trpc';

export default function Home() {
	const [count, setCount] = useState(0);

	const data = trpc.getUser.useQuery('Test');

	useEffect(() => {
		console.log(data.isLoading, data);
	}, [data, data.isLoading]);

	return (
		<>
			<h1>Mafia Engine</h1>
			<div className="card">
				<p>Test interactions by clicking the button below</p>
				<button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
				<p>{data.isLoading ? 'Data is loading from server...' : 'Data has loaded from server'}</p>
			</div>
		</>
	);
}
