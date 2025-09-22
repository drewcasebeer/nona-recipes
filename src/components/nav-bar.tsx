'use client';

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { APP_NAME } from "@/constants";
import { Button } from "./ui/button";
import { useState } from "react";
import { DarkModeToggle } from "./dark-mode-toggle";
import Image from "next/image";
import { UserButton } from "./user-button";
import { useIsMobile } from "@/hooks/use-mobile";

export const NavBar = () => {
	const [open, setOpen] = useState(false);
	const isMobile = useIsMobile();

	if(isMobile) {
		return (
			<header className="sticky top-0 z-40 w-full border-b bg-secondary">
				<div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
					<Link href="/" className="flex items-center gap-2 font-semibold">
						<Image src="/logo.png" alt="Logo" width={36} height={36} />
						<span>{APP_NAME}</span>
					</Link>

					<div className="flex items-center gap-2">
						<UserButton />

						<Button
							variant="ghost"
							size="icon"
							className="md:hidden"
							onClick={() => setOpen(v => !v)}
							aria-expanded={open}
							aria-label={open ? "Close menu" : "Open menu"}
						>
							{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
						</Button>
					</div>
				</div>

				{open ? (
					<div className="border-t md:hidden">
						<nav className="mx-auto grid max-w-6xl gap-2 px-4 py-3 text-sm">
							<Link href="#" className="rounded-md px-2 py-2 hover:bg-muted">
								Recipes
							</Link>
							<Link href="#" className="rounded-md px-2 py-2 hover:bg-muted">
								Categories
							</Link>
							<Link href="#" className="rounded-md px-2 py-2 hover:bg-muted">
								Collections
							</Link>
							<UserButton />
						</nav>
					</div>
				) : null}
			</header>
		)
	}

	return (
		<header className="sticky top-0 z-40 w-full border-b bg-secondary">
			<div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
				<Link href="/" className="flex items-center gap-2 font-semibold">
					<Image src="/logo.png" alt="Logo" width={36} height={36} />
					<span>{APP_NAME}</span>
				</Link>

				<nav className="hidden items-center gap-6 text-sm md:flex">
					<Link href="/recipes" className="text-muted-foreground hover:text-foreground">
						Recipes
					</Link>
					<Link href="/categories" className="text-muted-foreground hover:text-foreground">
						Categories
					</Link>
					<Link href="/collections" className="text-muted-foreground hover:text-foreground">
						Collections
					</Link>
				</nav>

				<div className="flex items-center gap-2">
					<UserButton />

					<Button
						variant="ghost"
						size="icon"
						className="md:hidden"
						onClick={() => setOpen(v => !v)}
						aria-expanded={open}
						aria-label={open ? "Close menu" : "Open menu"}
					>
						{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
					</Button>
				</div>
			</div>

			{open ? (
				<div className="border-t md:hidden">
					<nav className="mx-auto grid max-w-6xl gap-2 px-4 py-3 text-sm">
						<Link href="#" className="rounded-md px-2 py-2 hover:bg-muted">
							Recipes
						</Link>
						<Link href="#" className="rounded-md px-2 py-2 hover:bg-muted">
							Categories
						</Link>
						<Link href="#" className="rounded-md px-2 py-2 hover:bg-muted">
							Collections
						</Link>
						<UserButton />
					</nav>
				</div>
			) : null}
		</header>
	);
}