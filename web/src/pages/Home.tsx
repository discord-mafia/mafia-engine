import { AbsoluteCopyright } from '../components/Copyright';
import InfoPanel from '../components/InfoPanel';

function App() {
	return (
		<>
			<main
				className="box-border flex flex-col marker:items-center justify-center bg-darkGray bg-repeat pb-16 text-white sm:pt-24"
				style={{
					backgroundImage: 'url(/chalkboard.jpg)',
				}}
			>
				<AbsoluteCopyright />

				<h1 className="mb-2 mt-4 text-center text-6xl font-extrabold">
					<span className="text-red-400">Mafia</span> Engine
				</h1>
				<p className="px-4 text-center text-lg">Discord bot for a community of dedicated players of Mafia.</p>
				<div className="mx-2 my-8 flex flex-row flex-wrap justify-center gap-4 sm:mx-0">
					<InfoPanel
						name="Wiki"
						info="Provides you with anything that is to know about Mafia. Roles, Mechanics, Guides, Anything."
						link="https://discord-mafia-role-cards.fandom.com/wiki/Discord_Mafia_Role_cards_Wiki"
						linkText="Visit our Wiki"
					/>
					<InfoPanel
						name="Discord"
						info="We base our community on Discord. Join us to hang out and play some Mafia!"
						link="https://discord.gg/social-deduction"
						linkText="Join our Discord"
					/>
					<InfoPanel
						name="YouTube"
						info="Guides on playing and hosting Mafia, funny moments and other wacky stuff!"
						link="https://www.youtube.com/@discord-mafia"
						linkText="Check out our YouTube"
					/>
				</div>
			</main>
		</>
	);
}

export default App;
