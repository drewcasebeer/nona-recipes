import { useTRPC } from "@/trpc/client";
import { RecipeGetOneWithDetails } from "@/modules/recipes/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import z from "zod";
import { recipeWithDetailsInsertSchema } from "@/modules/recipes/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { useState } from "react";
import { RecipeImageParser } from "./recipe-image-parser";

interface RecipeFormProps {
	onSuccess?: () => void;
	onCancel?: () => void;
	initialValues?: RecipeGetOneWithDetails;
}

type FormValues = z.infer<typeof recipeWithDetailsInsertSchema>;

export const RecipeForm = ({ onSuccess, onCancel, initialValues }: RecipeFormProps) => {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const [draggedItem, setDraggedItem] = useState<{
		type: 'group' | 'step';
		index: number;
	} | null>(null);
	
	const [dragOverIndex, setDragOverIndex] = useState<{
		type: 'group' | 'step';
		index: number;
	} | null>(null);
	
	const [pendingDeletion, setPendingDeletion] = useState<{
		type: 'group' | 'ingredient' | 'step';
		groupIndex?: number;
		ingredientIndex?: number;
		stepIndex?: number;
	} | null>(null);

	const createRecipe = useMutation(
		trpc.recipes.createWithDetails.mutationOptions({
			onSuccess: async () => {
				await queryClient.invalidateQueries(trpc.recipes.getMany.queryOptions({}));
				onSuccess?.();
				toast.success("Recipe created successfully!");
			},
			onError: error => {
				toast.error(error.message);
			},
		})
	);

	const updateRecipe = useMutation(
		trpc.recipes.updateWithDetails.mutationOptions({
			onSuccess: async () => {
				await queryClient.invalidateQueries(trpc.recipes.getMany.queryOptions({}));

				if (initialValues?.id) {
					await queryClient.invalidateQueries(trpc.recipes.getOne.queryOptions({ id: initialValues.id }));
					await queryClient.invalidateQueries(trpc.recipes.getOneWithDetails.queryOptions({ id: initialValues.id }));
				}

				onSuccess?.();
				toast.success("Recipe updated successfully!");
			},
			onError: error => {
				toast.error(error.message);
			},
		})
	);

	const form = useForm<FormValues>({
		resolver: zodResolver(recipeWithDetailsInsertSchema),
		defaultValues: {
			title: initialValues?.title ?? "",
			description: initialValues?.description ?? "",
			servings: initialValues?.servings ?? undefined,
			time: initialValues?.time ?? undefined,
			heroImage: initialValues?.heroImage ?? "",
			ingredientGroups: initialValues?.ingredientGroups?.length 
				? initialValues.ingredientGroups.map((group, index) => ({
					name: group.name ?? "",
					sortOrder: group.sortOrder ?? index,
					ingredients: group.ingredients.length 
						? group.ingredients 
						: [{ description: "" }]
				}))
				: [{ 
					name: "", 
					sortOrder: 0, 
					ingredients: [{ description: "" }] 
				}],
			steps: initialValues?.steps?.length 
				? initialValues.steps.map((step, index) => ({
					description: step.description,
					sortOrder: step.sortOrder ?? index
				}))
				: [{ description: "", sortOrder: 0 }],
		},
	});

	const {
		fields: ingredientGroupFields,
		append: appendIngredientGroup,
		remove: removeIngredientGroup,
		move: moveIngredientGroup,
	} = useFieldArray({
		control: form.control,
		name: "ingredientGroups",
	});

	const {
		fields: stepFields,
		append: appendStep,
		remove: removeStep,
		move: moveStep,
	} = useFieldArray({
		control: form.control,
		name: "steps",
	});

	const isEdit = !!initialValues?.id;
	const isPending = createRecipe.isPending || updateRecipe.isPending;

	const onSubmit = (values: FormValues) => {
		if (isEdit && initialValues?.id) {
			// For updates, we need to add the id and use the update schema
			const updateData = { ...values, id: initialValues.id };
			updateRecipe.mutate(updateData);
		} else {
			createRecipe.mutate(values);
		}
	};

	const addIngredientGroup = () => {
		appendIngredientGroup({
			name: "",
			sortOrder: ingredientGroupFields.length,
			ingredients: [{ description: "" }],
		});
	};

	const addIngredient = (groupIndex: number) => {
		const currentIngredients = form.getValues(`ingredientGroups.${groupIndex}.ingredients`) || [];
		form.setValue(`ingredientGroups.${groupIndex}.ingredients`, [
			...currentIngredients,
			{ description: "" },
		]);
	};

	const removeIngredient = (groupIndex: number, ingredientIndex: number) => {
		const currentIngredients = form.getValues(`ingredientGroups.${groupIndex}.ingredients`);
		const newIngredients = currentIngredients.filter((_, index) => index !== ingredientIndex);
		form.setValue(`ingredientGroups.${groupIndex}.ingredients`, newIngredients);
	};

	const addStep = () => {
		appendStep({
			description: "",
			sortOrder: stepFields.length,
		});
	};

	const handleDragStart = (e: React.DragEvent, type: 'group' | 'step', index: number) => {
		setDraggedItem({ type, index });
		e.dataTransfer.effectAllowed = 'move';
	};

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = 'move';
	};

	const handleDragOverWithIndex = (e: React.DragEvent<HTMLDivElement>, type: 'group' | 'step', index: number) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = 'move';
		
		if (draggedItem && draggedItem.type === type) {
			setDragOverIndex({ type, index });
		}
	};

	const handleDragLeave = (e: React.DragEvent) => {
		// Only clear if we're leaving the container, not moving between child elements
		if (!e.currentTarget.contains(e.relatedTarget as Node)) {
			setDragOverIndex(null);
		}
	};

	const handleDrop = (e: React.DragEvent, type: 'group' | 'step', targetIndex: number) => {
		e.preventDefault();
		
		if (!draggedItem || draggedItem.type !== type) return;
		
		const sourceIndex = draggedItem.index;
		if (sourceIndex === targetIndex) return;

		if (type === 'group') {
			moveIngredientGroup(sourceIndex, targetIndex);
		} else {
			moveStep(sourceIndex, targetIndex);
		}
		
		setDraggedItem(null);
		setDragOverIndex(null);
	};

	const handleDragEnd = () => {
		setDraggedItem(null);
		setDragOverIndex(null);
	};

	const confirmDelete = () => {
		if (!pendingDeletion) return;

		const { type, groupIndex, ingredientIndex, stepIndex } = pendingDeletion;

		if (type === 'group' && groupIndex !== undefined) {
			removeIngredientGroup(groupIndex);
		} else if (type === 'ingredient' && groupIndex !== undefined && ingredientIndex !== undefined) {
			removeIngredient(groupIndex, ingredientIndex);
		} else if (type === 'step' && stepIndex !== undefined) {
			removeStep(stepIndex);
		}

		setPendingDeletion(null);
	};

	const handleParsedData = (data: FormValues) => {
		form.reset({
			...form.getValues(),
			...data,
		});
	};

	return (
		<>
			<Form {...form}>
				<form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
					{/* Call AI To Parse Image */}
					<RecipeImageParser onParseSuccess={handleParsedData} />

					{/* Basic Recipe Info */}
					<Card>
						<CardHeader>
							<CardTitle>Basic Information</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									name="title"
									control={form.control}
									render={({ field }) => (
										<FormItem>
											<FormLabel>Recipe Title *</FormLabel>
											<FormControl>
												<Input {...field} placeholder="Chicken Noodle Soup" />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									name="servings"
									control={form.control}
									render={({ field }) => (
										<FormItem>
											<FormLabel>Servings</FormLabel>
											<FormControl>
												<Input
													{...field}
													type="number"
													placeholder="Number of servings"
													onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
													value={field.value ?? ""}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									name="time"
									control={form.control}
									render={({ field }) => (
										<FormItem>
											<FormLabel>Cooking Time (minutes)</FormLabel>
											<FormControl>
												<Input
													{...field}
													type="number"
													placeholder="Total time in minutes"
													onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
													value={field.value ?? ""}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									name="heroImage"
									control={form.control}
									render={({ field }) => (
										<FormItem>
											<FormLabel>Hero Image URL</FormLabel>
											<FormControl>
												<Input {...field} placeholder="Image URL (optional)" />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<FormField
								name="description"
								control={form.control}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Description</FormLabel>
										<FormControl>
											<Textarea {...field} placeholder="Brief description of the recipe" rows={3} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</CardContent>
					</Card>

					{/* Ingredient Groups */}
					<Card>
						<CardHeader className="flex flex-row items-center justify-between">
							<CardTitle>Ingredients</CardTitle>
							<Button type="button" onClick={addIngredientGroup} variant="outline" size="sm">
								<Plus className="h-4 w-4 mr-2" />
								Add Group
							</Button>
						</CardHeader>
						<CardContent className="space-y-6">
							{ingredientGroupFields.map((group, groupIndex) => (
								<div key={group.id}>
									{/* Drop indicator above */}
									{dragOverIndex?.type === "group" &&
										dragOverIndex.index === groupIndex &&
										draggedItem &&
										draggedItem.index > groupIndex && (
											<div className="h-1 bg-blue-500 rounded-full mb-2 animate-pulse" />
										)}

									<div
										className={`border rounded-lg p-4 space-y-4 transition-all duration-200 ${
											draggedItem?.type === "group" && draggedItem.index === groupIndex
												? "opacity-50 scale-[0.98]"
												: dragOverIndex?.type === "group" && dragOverIndex.index === groupIndex
												? "ring-2 ring-blue-500 ring-opacity-50 shadow-lg"
												: "hover:shadow-md"
										}`}
										onDragOver={e => {
											e.preventDefault();
											e.dataTransfer.dropEffect = "move";
											if (draggedItem && draggedItem.type === "group") {
												setDragOverIndex({ type: "group", index: groupIndex });
											}
										}}
										onDragLeave={handleDragLeave}
										onDrop={e => handleDrop(e, "group", groupIndex)}
									>
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2">
												<div
													className="flex items-center gap-2 cursor-grab active:cursor-grabbing"
													draggable
													onDragStart={e => handleDragStart(e, "group", groupIndex)}
													onDragEnd={handleDragEnd}
												>
													<GripVertical className="h-4 w-4 text-muted-foreground" />
													<Badge variant="secondary">Group {groupIndex + 1}</Badge>
												</div>
												{ingredientGroupFields.length > 1 && (
													<Button
														type="button"
														onClick={() => setPendingDeletion({ type: "group", groupIndex })}
														variant="ghost"
														size="sm"
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												)}
											</div>
										</div>

										<FormField
											name={`ingredientGroups.${groupIndex}.name`}
											control={form.control}
											render={({ field }) => (
												<FormItem>
													<FormLabel>Group Name (optional)</FormLabel>
													<FormControl>
														<Input {...field} placeholder="e.g., 'Cake Batter', 'Frosting', 'Marinade'" />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<div className="space-y-2">
											{form.watch(`ingredientGroups.${groupIndex}.ingredients`)?.map((ingredient, ingredientIndex) => (
												<div
													key={ingredientIndex}
													className="flex gap-2 p-2 border rounded-md hover:shadow-sm transition-shadow"
												>
													<FormField
														name={`ingredientGroups.${groupIndex}.ingredients.${ingredientIndex}.description`}
														control={form.control}
														render={({ field }) => (
															<FormItem className="flex-1">
																<FormControl>
																	<Input
																		{...field}
																		placeholder={`Ingredient ${ingredientIndex + 1} (e.g., '2 cups flour')`}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
													{(form.watch(`ingredientGroups.${groupIndex}.ingredients`) || []).length > 1 && (
														<Button
															type="button"
															onClick={() => setPendingDeletion({ type: "ingredient", groupIndex, ingredientIndex })}
															variant="ghost"
															size="sm"
														>
															<Trash2 className="h-4 w-4" />
														</Button>
													)}
												</div>
											))}

											{/* Add Ingredient button at the bottom of ingredients */}
											<Button
												type="button"
												onClick={() => addIngredient(groupIndex)}
												variant="outline"
												size="sm"
												className="w-full mt-2"
											>
												<Plus className="h-4 w-4 mr-2" />
												Add Ingredient
											</Button>
										</div>

										{/* Drop indicator below */}
										{dragOverIndex?.type === "group" &&
											dragOverIndex.index === groupIndex &&
											draggedItem &&
											draggedItem.index < groupIndex && (
												<div className="h-1 bg-blue-500 rounded-full mt-2 animate-pulse" />
											)}
									</div>
								</div>
							))}
						</CardContent>
					</Card>

					{/* Recipe Steps */}
					<Card>
						<CardHeader className="flex flex-row items-center justify-between">
							<CardTitle>Instructions</CardTitle>
							<Button type="button" onClick={addStep} variant="outline" size="sm">
								<Plus className="h-4 w-4 mr-2" />
								Add Step
							</Button>
						</CardHeader>
						<CardContent className="space-y-4">
							{stepFields.map((step, stepIndex) => (
								<div key={step.id}>
									{/* Drop indicator above */}
									{dragOverIndex?.type === "step" &&
										dragOverIndex.index === stepIndex &&
										draggedItem &&
										draggedItem.index > stepIndex && (
											<div className="h-1 bg-blue-500 rounded-full mb-2 animate-pulse" />
										)}

									<div
										className={`border rounded-lg p-3 transition-all duration-200 ${
											draggedItem?.type === "step" && draggedItem.index === stepIndex
												? "opacity-50 scale-[0.98]"
												: dragOverIndex?.type === "step" && dragOverIndex.index === stepIndex
												? "ring-2 ring-blue-500 ring-opacity-50 shadow-lg"
												: "hover:shadow-md"
										}`}
										onDragOver={e => {
											e.preventDefault();
											e.dataTransfer.dropEffect = "move";
											if (draggedItem && draggedItem.type === "step") {
												setDragOverIndex({ type: "step", index: stepIndex });
											}
										}}
										onDragLeave={handleDragLeave}
										onDrop={e => handleDrop(e, "step", stepIndex)}
									>
										<div className="flex gap-3 items-start">
											<div
												className="flex flex-col items-center gap-2 mt-1 cursor-grab active:cursor-grabbing"
												draggable
												onDragStart={e => handleDragStart(e, "step", stepIndex)}
												onDragEnd={handleDragEnd}
											>
												<GripVertical className="h-4 w-4 text-muted-foreground" />
												<span className="shrink-0 text-sm font-medium text-muted-foreground">{stepIndex + 1}</span>
											</div>
											<FormField
												name={`steps.${stepIndex}.description`}
												control={form.control}
												render={({ field }) => (
													<FormItem className="flex-1">
														<FormControl>
															<Textarea {...field} placeholder={`Step ${stepIndex + 1} instructions`} rows={2} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											{stepFields.length > 1 && (
												<Button
													type="button"
													onClick={() => setPendingDeletion({ type: "step", stepIndex })}
													variant="ghost"
													size="sm"
													className="mt-1"
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											)}
										</div>

										{/* Drop indicator below */}
										{dragOverIndex?.type === "step" &&
											dragOverIndex.index === stepIndex &&
											draggedItem &&
											draggedItem.index < stepIndex && (
												<div className="h-1 bg-blue-500 rounded-full mt-2 animate-pulse" />
											)}
									</div>
								</div>
							))}
						</CardContent>
					</Card>

					<div className="flex justify-between gap-x-2">
						{onCancel && (
							<Button type="button" variant="ghost" disabled={isPending} onClick={onCancel}>
								Cancel
							</Button>
						)}

						<Button type="submit" disabled={isPending} className="ml-auto">
							{isPending ? "Saving..." : isEdit ? "Update Recipe" : "Create Recipe"}
						</Button>
					</div>
				</form>
			</Form>

			{/* Confirmation Dialog */}
			<AlertDialog open={!!pendingDeletion} onOpenChange={() => setPendingDeletion(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete this {pendingDeletion?.type}? This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setPendingDeletion(null)}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={confirmDelete}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
};