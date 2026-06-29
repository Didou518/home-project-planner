export default function PageTemplate({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="w-full px-4 py-4 sm:px-8 lg:px-11">{children}</div>
	);
}
