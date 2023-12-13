import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles/tailwind.css';

import NotFound from './pages/NotFound';
import Home from './pages/Home';
import Downloads from './pages/Downloads';
import Layout from './pages/Layout';

import { library } from '@fortawesome/fontawesome-svg-core';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { faCheckSquare, faCoffee, faCircleXmark } from '@fortawesome/free-solid-svg-icons';

library.add(fab, faCheckSquare, faCoffee, faCircleXmark);

export function RootApp() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Layout />}>
					<Route index element={<Home />} />
					<Route path="/downloads" element={<Downloads />} />
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
