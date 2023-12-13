export default function Copyright() {
	return <div className="text-xs">Copyright © 2023 Mafia Engine</div>;
}

export function AbsoluteCopyright() {
	return (
		<div className="absolute bottom-0 left-0 p-4">
			<Copyright />
		</div>
	);
}
