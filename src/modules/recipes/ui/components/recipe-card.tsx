"use client";

import Link from "next/link";
import { Clock, Flame, Heart, Star } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RecipeGetOne } from "@/modules/recipes/types";
import { convertTimeToString } from "@/lib/utils";

type Props = {
	recipe: RecipeGetOne;
};



export function RecipeCard({ recipe }: Props) {
	const { id, title, description, heroImage, rating, author } = recipe;

	const time = recipe.time ? convertTimeToString(recipe.time) : null;

	return (
		<Card className="overflow-hidden py-0">
			<CardHeader className="relative px-0">
				<Link href={`/recipes/${id}`} className="block">
					<div className="aspect-[4/3] w-full overflow-hidden">
						<img
							src={heroImage || "/placeholder.png"}
							alt={`${title} photo`}
							width={800}
							height={600}
							className="h-full w-full object-cover"
						/>
					</div>
				</Link>

				<div className="absolute left-2 top-2 flex gap-2">
					{time && <Badge className="bg-black/70 text-white backdrop-blur">{time}</Badge>}
					{rating && <Badge variant="secondary" className="backdrop-blur">
						<Star className="mr-1 h-3.5 w-3.5 fill-amber-500 text-amber-500" />
						{rating.toFixed(1)}
					</Badge>}
				</div>

				<Button
					size="icon"
					variant="secondary"
					aria-label="Save recipe"
					className="absolute right-2 top-2 rounded-full bg-white/90 hover:bg-white"
					onClick={() => alert(`Saved ${title}`)}
				>
					<Heart className="h-4 w-4 text-amber-600" />
				</Button>
			</CardHeader>

			<CardContent className="space-y-2 p-4">
				<h3 className="line-clamp-2 text-base font-semibold">
					<Link href={`/recipes/${id}`} className="hover:underline">
						{title}
					</Link>
				</h3>
				<p className="line-clamp-2 text-sm text-muted-foreground">{description}</p>
				<div className="flex flex-wrap gap-1">
					{/* {tags?.map(t => (
						<Badge key={`${id}-${t}`} variant="outline" className="rounded-full">
							{t}
						</Badge>
					))} */}
				</div>
			</CardContent>

			<CardFooter className="flex items-center justify-between border-t bg-muted/60 px-4 py-3 text-xs text-muted-foreground">
				<div className="flex items-center gap-2">
					<Clock className="h-3.5 w-3.5" />
					<span>{time}</span>
				</div>
				<div className="truncate">By {author}</div>
			</CardFooter>
		</Card>
	);
}
