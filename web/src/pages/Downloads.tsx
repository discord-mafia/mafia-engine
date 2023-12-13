import { AbsoluteCopyright } from '../components/Copyright';

export default function Downloads() {
	return (
		<>
			<main
				className="flex h-smallview flex-col items-center justify-center bg-repeat text-white"
				style={{
					backgroundImage: 'url(/chalkboard.jpg)',
				}}
			>
				<AbsoluteCopyright />

				<h1 className="mb-2 mt-24 text-center text-6xl font-extrabold">
					<span className="text-red-400">Mafia</span> Engine
				</h1>
				<p className="px-4 text-center text-lg">Download our advertising app for MacOS and Windows</p>
				<div className="my-8 flex flex-row flex-wrap justify-center gap-4">
					<DownloadPanel
						name="Linux"
						// link="https://docs.google.com/uc?export=download&id=1zWsnYp12cja9U5RjbClMywH1qN2ke2xF"
					/>
					<DownloadPanel name="Windows" link="https://docs.google.com/uc?export=download&id=12JjgehAMvwEIu0MCvBr-3gfh76GmsDk_" />
					<DownloadPanel name="MacOS" link="https://docs.google.com/uc?export=download&id=1zWsnYp12cja9U5RjbClMywH1qN2ke2xF" />{' '}
				</div>
			</main>
		</>
	);
}

type InfoPanelProps = {
	name: string;
	link?: string;
};

function DownloadPanel({ name, link }: InfoPanelProps) {
	const onClick = () => {
		if (link) window.open(link);
	};

	return (
		<div
			className={`flex w-44 flex-col overflow-hidden rounded-md border border-zinc-300 transition-all hover:cursor-pointer sm:w-60 sm:hover:scale-110`}
			onClick={onClick}
		>
			<div className="flex flex-row items-center justify-center gap-2 bg-zinc-800 p-2 pl-4 text-center align-middle">
				<span className="text-md text-center sm:text-lg">{name}</span>
			</div>
			{link && <span className="my-4 text-center text-xs underline hover:text-red-500 sm:text-sm">Download File</span>}
			{!link && <span className="my-4 text-center text-xs sm:text-sm">Coming Soon</span>}
		</div>
	);
}
