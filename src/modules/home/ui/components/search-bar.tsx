"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
	placeholder?: string;
	onSearch?: (query: string) => void;
};

export function SearchBar({ placeholder = "Search recipes...", onSearch = () => {} }: Props) {
	const [query, setQuery] = useState("");

	return (
		<form
			role="search"
			aria-label="Recipe search"
			className="flex flex-col gap-2 sm:flex-row"
			onSubmit={e => {
				e.preventDefault();
				onSearch(query);
			}}
		>
			<div className="flex w-full items-center gap-2">
				<div className="relative flex-1">
					<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						value={query}
						onChange={e => setQuery(e.target.value)}
						placeholder={placeholder}
						className="w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none ring-0 focus-visible:border-amber-500 focus-visible:ring-2 focus-visible:ring-amber-200"
					/>
				</div>
			</div>

			<Button type="submit" className="bg-amber-600 hover:bg-amber-600/90">
				Search
			</Button>
		</form>
	);
}
