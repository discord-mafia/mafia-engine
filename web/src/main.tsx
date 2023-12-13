import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles/tailwind.css';

import NotFound from './pages/NotFound';
import Home from './pages/Home';
// import Layout from './pages/Layout';

export function RootApp() {
	return (
		<BrowserRouter>
			<Routes>
				{/* <Route path="/" element={<Layout />}> */}
				<Route path="/">
					<Route index element={<Home />} />
					<Route path="*" element={<NotFound />} />
				</Route>
			</Routes>
		</BrowserRouter>
	);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<RootApp />
	</React.StrictMode>
);
