import { Outlet, Link } from 'react-router-dom';

const Layout = () => {
	return (
		<>
			<nav className="flex-shrink">
				<ul>
					<li>
						<Link to="/">Home</Link>
					</li>
				</ul>
			</nav>

			<Outlet />
		</>
	);
};

export default Layout;
