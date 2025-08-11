"use client";

import { useCallback, useMemo, useState } from "react";
import { Bookmark, Printer, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
	title?: string;
	id?: string;
};

export function RecipeActions({ title = "Recipe", id = "0" }: Props) {
	const [saved, setSaved] = useState<boolean>(false);

	const shareData = useMemo(
		() => ({
			title: `${title} · Recipe`,
			text: `Check out this recipe: ${title}`,
			url: typeof window !== "undefined" ? window.location.href : "",
		}),
		[title]
	);

	const onShare = useCallback(async () => {
		try {
			if (navigator.share) {
				await navigator.share(shareData);
			} else if (navigator.clipboard) {
				await navigator.clipboard.writeText(shareData.url || "");
				alert("Link copied to clipboard");
			} else {
				alert("Share not supported on this browser");
			}
		} catch (e) {
			// User cancelled share or an error occurred
		}
	}, [shareData]);

	return (
		<div className="flex items-center gap-2">
			<Button
				variant={saved ? "default" : "outline"}
				className={saved ? "bg-amber-600 hover:bg-amber-600/90" : ""}
				onClick={() => setSaved(s => !s)}
				aria-pressed={saved}
			>
				<Bookmark className="mr-2 h-4 w-4" />
				{saved ? "Saved" : "Save"}
			</Button>
			<Button variant="outline" onClick={() => window.print()}>
				<Printer className="mr-2 h-4 w-4" />
				Print
			</Button>
			<Button variant="outline" onClick={onShare}>
				<Share2 className="mr-2 h-4 w-4" />
				Share
			</Button>
		</div>
	);
}
