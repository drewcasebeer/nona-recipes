"use client";

import { useState } from "react";
import { Bookmark, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
	title?: string;
	id?: string;
};

export function RecipeActions({ title = "Recipe", id = "0" }: Props) {
	const [favorited, setFavorited] = useState<boolean>(false);

	return (
		<div className="flex items-center gap-2">
			<Button
				variant={favorited ? "default" : "outline"}
				className={favorited ? "bg-primary hover:bg-primary/90" : ""}
				onClick={() => setFavorited(s => !s)}
				aria-pressed={favorited}
			>
				<Bookmark className="mr-2 h-4 w-4" />
				{favorited ? "Favorited" : "Favorite"}
			</Button>
			<Button variant="outline" onClick={() => window.print()}>
				<Printer className="mr-2 h-4 w-4" />
				Print
			</Button>
		</div>
	);
}
