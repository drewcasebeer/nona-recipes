"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import z from "zod";
import { recipeWithDetailsInsertSchema } from "@/modules/recipes/schemas";
import { UploadButton, UploadDropzone } from "@/lib/uploadthing";
import { ClientUploadedFileData } from "uploadthing/types";

// Define the type for the data we expect back from the AI
type ParsedRecipeData = z.infer<typeof recipeWithDetailsInsertSchema>;

interface RecipeImageParserProps {
	onParseSuccess: (data: ParsedRecipeData) => void;
}

interface LabelContentProps {
	ready: boolean;
}

const getDropZoneLabel = ({ ready }: LabelContentProps) => {
	if (ready) {
		return (
			<div className="p-4t text-center">
				<p className="text-sm text-primary">Drag & drop an image here to parse it with AI</p>
			</div>
		);
	}

	return (
		<div className="p-4 text-center animate-pulse">
			<p className="text-sm text-primary">Loading...</p>
		</div>
	);
};

const getAllowedContent = (test) => {
	console.log({test});
	return (
		<div className="text-xs text-gray-400 mt-2">
			<p>Allowed file types: .jpg, .jpeg, .png</p>
			<p>Max file size: 4MB</p>
		</div>
	);
}

export const RecipeImageParser = ({ onParseSuccess }: RecipeImageParserProps) => {
	const trpc = useTRPC();
	const [loading, setLoading] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);

	// This mutation will be a new endpoint in your TRPC router
	const parseImage = useMutation(
		trpc.recipes.parseImage.mutationOptions({
			onSuccess: data => {
				console.log({data})
				onParseSuccess(data); // Pass the parsed data back to the parent form
				toast.success("Form populated from image!");
			},
			onError: error => {
				toast.error(error.message || "Failed to parse image.");
			},
			onSettled: () => setLoading(false),
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

	const handleParseImage = async (results: ClientUploadedFileData<{
    url: string;
}>[]) => {
		// if (!selectedFile) {
		// 	toast.error("Please select an image to parse.");
		// 	return;
		// }

		const imageUrl = results?.[0]?.ufsUrl;

		// Convert the image file to a base64 string
		// const imageData = await readFileAsDataURL(selectedFile);

		setLoading(true);
		parseImage.mutate({ imageUrl });
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Import from Image</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{loading ? (
					<div className="p-4 text-center animate-pulse">
						<p className="text-sm text-primary">Talking to our AI Overlords...</p>
					</div>
				) : (
					<div>
						<p className="text-sm text-muted-foreground">
							Upload an image of a recipe to automatically fill out the form.
						</p>
						<div className="flex gap-2 items-end">
							{/* <Input type="file" accept="image/*" onChange={e => setSelectedFile(e.target.files?.[0] || null)} />
						<Button type="button" onClick={handleParseImage} disabled={!selectedFile || parseImage.isPending}>
							{parseImage.isPending ? "Parsing..." : "Parse Image"}
						</Button> */}
							<UploadDropzone
								className="w-full ut-button:bg-primary ut-button:text-black ut-button:px-2"
								endpoint="recipeParserImageUploader"
								onClientUploadComplete={handleParseImage}
								config={{
									mode: "auto",
								}}
								content={{
									label: getDropZoneLabel,
									// 	allowedContent: getAllowedContent
								}}
							/>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
};
