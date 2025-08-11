import { NavBar } from "@/components/nav-bar";

interface Props {
	children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
	return (
		<div className="flex min-h-screen flex-col">
			<NavBar />

			<main className="flex-1">
				{children}
			</main>
		</div>
	);
};

export default Layout;
