export default function PageTemplate({
	children,
}: {
	children: React.ReactNode;
}) {
	return <div className="py-4 px-11 w-full">{children}</div>;
}
