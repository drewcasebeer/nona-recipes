"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRecipesFilters } from "@/modules/recipes/hooks/use-recipes-filters";
import { useRouter } from "next/navigation";


type Props = {
	placeholder?: string;
};

export function SearchBar({ placeholder = "Search recipes..." }: Props) {
	const [filters, setFilters] = useRecipesFilters();
	const router = useRouter();

	const submitForm = (e: React.FormEvent) => {
		e.preventDefault();
		// Navigate to recipes page with search query preserved
		const searchParams = new URLSearchParams();
		if (filters.search.trim()) {
			searchParams.set("search", filters.search.trim());
		}
		searchParams.set("page", "1");
		router.push(`/recipes?${searchParams.toString()}`);
	}

	return (
		<form role="search" aria-label="Recipe search" className="flex flex-col gap-2 sm:flex-row" onSubmit={submitForm}>
			<div className="flex w-full items-center gap-2">
				<div className="relative flex-1">
					<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						value={filters.search}
						onChange={e => setFilters({ search: e.target.value })}
						placeholder={placeholder}
						className="pl-9 pr-3"
					/>
				</div>
			</div>

			<Button type="submit" className="bg-primary hover:bg-primary/90">
				Search
			</Button>
		</form>
	);
}
