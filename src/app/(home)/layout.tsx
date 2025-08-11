import { NavBar } from "@/components/nav-bar";
import { SidebarProvider } from "@/components/ui/sidebar";
// import { DashboardNavbar } from "@/modules/dashboard/ui/components/dashboard-navbar";
import HomeSidebar from "@/modules/home/ui/components/home-sidebar";

interface Props {
	children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
	return (
		<div className="flex min-h-screen flex-col">
			{/* <HomeSidebar /> */}
			<NavBar />
			<main className="flex-1 bg-muted">
				{/* <DashboardNavbar /> */}
				{children}
			</main>
		</div>
	);
};

export default Layout;
