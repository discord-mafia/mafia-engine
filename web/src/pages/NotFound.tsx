import { AbsoluteCopyright } from '../components/Copyright';

export default function NotFound() {
	return (
		<main
			className="flex h-smallview flex-col items-center justify-center bg-repeat text-white"
			style={{
				backgroundImage: 'url(/chalkboard.jpg)',
			}}
		>
			<AbsoluteCopyright />

			<h1 className="mb-2 text-6xl font-extrabold">
				<span className="text-red-400">404</span>
			</h1>
			<p className="text-center text-lg">Page not found</p>
		</main>
	);
}
