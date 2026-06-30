export default function Heading1({ children }: { children: React.ReactNode }) {
	// text-3xl sur mobile pour compacter ; text-4xl dès sm (desktop inchangé).
	return <h1 className="text-3xl font-bold sm:text-4xl">{children}</h1>;
}
