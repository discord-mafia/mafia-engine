import { Link, useNavigate } from 'react-router-dom';

type InfoPanelProps = {
	name: string;
	info: string;
	link?: string;
	internalLink?: string;
	linkText: string;
};

export default function InfoPanel({ name, info, link, linkText, internalLink }: InfoPanelProps) {
	const navigate = useNavigate();

	const onClick = () => {
		if (link) window.open(link);
		else if (internalLink) navigate(internalLink);
	};

	return (
		<div
			className={`flex w-44 flex-col overflow-hidden rounded-md border border-zinc-300 transition-all hover:cursor-pointer sm:aspect-square sm:w-56 sm:hover:scale-110`}
			onClick={onClick}
		>
			<div className="flex flex-row items-center gap-2 bg-zinc-800 p-2 pl-4 align-middle ">
				<span className="text-md w-full text-center sm:text-center sm:text-lg">{name}</span>
			</div>
			<div className="hidden grow sm:block">
				<div className="mx-3 mt-3 text-xs sm:mx-6 sm:mt-6 sm:text-sm">{info}</div>
			</div>
			{link && (
				<a href={link} className="mb-4 hidden text-center text-xs underline hover:text-red-500 sm:block sm:text-sm">
					{linkText}
				</a>
			)}

			{internalLink && (
				<Link to={internalLink}>
					<span className="mb-4 hidden text-center text-xs underline hover:text-red-500 sm:block sm:text-sm">{linkText}</span>
				</Link>
			)}
		</div>
	);
}
