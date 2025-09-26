import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Star } from "lucide-react";
import Image from "next/image";
import { SearchBar } from "./search-bar";

export const HomeHero = () => {
	return (
		<section>
			<div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
				<div className="grid items-center gap-8 md:grid-cols-[1.2fr_1fr]">
					<div>
						<Badge className="bg-primary hover:bg-primary/90 text-white">New</Badge>
						<h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Cook delicious food, simply.</h1>
						<p className="mt-3 max-w-prose text-muted-foreground">
							Explore chef-tested recipes with clear steps, helpful tips, and easy filters. From quick weeknights to
							slow Sunday feasts, we&apos;ve got you covered.
						</p>
						<div className="mt-6">
							<SearchBar placeholder="Search recipes, ingredients, cuisines..." />
						</div>
						<div className="mt-4 flex flex-wrap items-center gap-2">
							<span className="text-sm text-muted-foreground">Popular:</span>
							{["pasta", "chicken", "vegetarian", "dessert"].map(t => (
								<Badge key={t} variant="secondary" className="rounded-full">
									#{t}
								</Badge>
							))}
						</div>
					</div>

					<div className="relative">
						<div className="w-full shadow-sm">
							<Image
								src="/logo.png"
								alt="Chef preparing fresh ingredients"
								width={800}
								height={600}
								className="h-full w-full object-cover"
								priority
							/>
						</div>
						
						<Card className="absolute -bottom-6 -left-24 hidden w-52 rotate-[-3deg] sm:block">
							<CardHeader className="pb-2">
								<CardTitle className="flex items-center gap-2 text-base">
									<Flame className="h-4 w-4 text-amber-600" />
									Trending
								</CardTitle>
							</CardHeader>

							<CardContent className="pt-0 text-sm">
								Creamy Garlic Mushroom Pasta
								<div className="mt-2 flex items-center gap-1 text-amber-600">
									<Star className="h-4 w-4 fill-primary text-primary" />
									<span className="font-medium">4.8</span>
									<span className="text-muted-foreground">· 25 min</span>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</section>
	);
}