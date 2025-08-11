import { APP_NAME } from "@/constants";
import Link from "next/link";

export function Footer() {
	return (
		<footer className="border-t">
			<div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row">
				<p>© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
				<nav className="flex items-center gap-4">
					<Link href="#" className="hover:text-foreground">
						Privacy
					</Link>
					<Link href="#" className="hover:text-foreground">
						Terms
					</Link>
					<Link href="#" className="hover:text-foreground">
						Contact
					</Link>
				</nav>
			</div>
		</footer>
	);
}
