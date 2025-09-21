// RecipeImageParser.tsx

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import z from "zod";
import { recipeWithDetailsInsertSchema } from "@/modules/recipes/schemas";

// Define the type for the data we expect back from the AI
type ParsedRecipeData = z.infer<typeof recipeWithDetailsInsertSchema>;

interface RecipeImageParserProps {
	onParseSuccess: (data: ParsedRecipeData) => void;
}

export const RecipeImageParser = ({ onParseSuccess }: RecipeImageParserProps) => {
	const trpc = useTRPC();
	const [selectedFile, setSelectedFile] = useState<File | null>(null);

	// This mutation will be a new endpoint in your TRPC router
	const parseImage = useMutation(
		trpc.recipes.parseImage.mutationOptions({
			onSuccess: data => {
				onParseSuccess(data); // Pass the parsed data back to the parent form
				toast.success("Form populated from image!");
			},
			onError: error => {
				toast.error(error.message || "Failed to parse image.");
			},
		})
	);

	const readFileAsDataURL = (file: File): Promise<string> => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => {
				if (typeof reader.result === "string") {
					resolve(reader.result);
				} else {
					reject(new Error("Failed to read file."));
				}
			}

			reader.onerror = () => reject(new Error("Failed to read file."));
			reader.readAsDataURL(file);
		});
	}

	const handleParseImage = async () => {
		if (!selectedFile) {
			toast.error("Please select an image to parse.");
			return;
		}

		// Convert the image file to a base64 string
		const imageData = await readFileAsDataURL(selectedFile);

		parseImage.mutate({ image: imageData });
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Import from Image</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<p className="text-sm text-muted-foreground">Upload an image of a recipe to automatically fill out the form.</p>
				<div className="flex gap-2 items-end">
					<Input type="file" accept="image/*" onChange={e => setSelectedFile(e.target.files?.[0] || null)} />
					<Button type="button" onClick={handleParseImage} disabled={!selectedFile || parseImage.isPending}>
						{parseImage.isPending ? "Parsing..." : "Parse Image"}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
};
