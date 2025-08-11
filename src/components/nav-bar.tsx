'use client';

import Link from "next/link";
import { ChefHat, Menu, X } from "lucide-react";
import { APP_NAME } from "@/constants";
import { Button } from "./ui/button";
import { useState } from "react";
import { DarkModeToggle } from "./dark-mode-toggle";
import Image from "next/image";

export const NavBar = () => {
	const [open, setOpen] = useState(false);

	return (
		<header className="sticky top-0 z-40 w-full border-b">
			<div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
				<Link href="/" className="flex items-center gap-2 font-semibold">
					<Image src="/logo.png" alt="Logo" width={36} height={36} />
					<span>{APP_NAME}</span>
				</Link>

				<nav className="hidden items-center gap-6 text-sm md:flex">
					<Link href="#" className="text-muted-foreground hover:text-foreground">
						Recipes
					</Link>
					<Link href="#" className="text-muted-foreground hover:text-foreground">
						Categories
					</Link>
					<Link href="#" className="text-muted-foreground hover:text-foreground">
						Collections
					</Link>
				</nav>

				<div className="flex items-center gap-2">
					<Button asChild variant="ghost" className="hidden sm:inline-flex">
						<Link href="/new-recipe">Submit Recipe</Link>
					</Button>

					<div className="mr-2 w-[1px] h-6 bg-accent" />

					<DarkModeToggle />

					<div className="ml-2 mr-2 w-[1px] h-6 bg-accent" />

					<Button asChild className="bg-amber-600 hover:bg-amber-600/90">
						<Link href="/sign-in">Sign in</Link>
					</Button>
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
						<Link href="#" className="rounded-md px-2 py-2 hover:bg-muted">
							Blog
						</Link>
						<Button asChild className="mt-1 bg-amber-600 hover:bg-amber-600/90">
							<Link href="/sign-in">Sign in</Link>
						</Button>
					</nav>
				</div>
			) : null}
		</header>
	);
}