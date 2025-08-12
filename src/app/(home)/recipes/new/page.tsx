"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { FloatingInput } from "@/components/ui/floatinginput";
import { FloatingTextarea } from "@/components/ui/floatingtextarea";

export default function NewRecipePage() {
    const trpc = useTRPC();
    const router = useRouter();
    const addRecipe = trpc.recipes.create.mutationOptions();

    type Difficulty = "Easy" | "Medium" | "Hard";

    const [form, setForm] = useState({
        title: "",
        description: "",
        image: "",
        time: "",
        author: "",
        servings: 1,
        difficulty: "Easy" as Difficulty,
        ingredients: [{ item: "", amount: "" }],
        steps: [""],
        tags: []
    });

    const [submitting, setSubmitting] = useState(false);

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        const { name, value } = e.target;
        if (name === "difficulty") {
            setForm(f => ({ ...f, difficulty: value as Difficulty }));
        } else {
            setForm(f => ({ ...f, [name]: value }));
        }
    }

    // Ingredient handlers
    function handleIngredientChange(index: number, field: "item" | "amount", value: string) {
        setForm((f) => {
            const newIngredients = [...f.ingredients];
            newIngredients[index] = { ...newIngredients[index], [field]: value };
            return { ...f, ingredients: newIngredients };
        });
    }

    function addIngredient() {
        setForm((f) => ({ ...f, ingredients: [...f.ingredients, { item: "", amount: "" }] }));
    }

    function removeIngredient(index: number) {
        setForm((f) => {
            const newIngredients = f.ingredients.filter((_, i) => i !== index);
            return { ...f, ingredients: newIngredients.length ? newIngredients : [{ item: "", amount: "" }] };
        });
    }

    // Step handlers
    function handleStepChange(index: number, value: string) {
        setForm((f) => {
            const newSteps = [...f.steps];
            newSteps[index] = value;
            return { ...f, steps: newSteps };
        });
    }

    function addStep() {
        setForm((f) => ({ ...f, steps: [...f.steps, ""] }));
    }

    function removeStep(index: number) {
        setForm((f) => {
            const newSteps = f.steps.filter((_, i) => i !== index);
            return { ...f, steps: newSteps.length ? newSteps : [""] };
        });
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await addRecipe.mutateAsync({
                ...form,
                rating: 0,  // Add a default rating
                servings: Number(form.servings),
                author: form.author || "Anonymous",
                tags: form.tags || []
            })
            toast.success("Recipe submitted successfully!");
            router.push(`/recipes/${res.id}`);
        } catch (error) {
            console.error('Error submitting recipe:', error);
            //toast.error("Failed to submit recipe. Please try again.");
            alert("Failed to submit recipe. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }



    return (
        <div className="max-w-3xl mx-auto py-10 px-4">
            <h1 className="text-3xl font-semibold mb-6 text-center">Submit a New Recipe</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                <FloatingInput
                    label="Title"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    required
                    className="w-full"
                />

                <FloatingTextarea
                    label="Description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    required
                    className="w-full"
                    rows={4}
                />

                <FloatingInput
                    label="Image URL"
                    name="image"
                    value={form.image}
                    onChange={handleChange}
                    className="w-full"
                />

                <div className="grid grid-cols-2 gap-4">
                    <FloatingInput
                        label="Duration"
                        name="time"
                        type="text"
                        value={form.time}
                        onChange={handleChange}
                        required
                    />
                    <FloatingInput
                        label="Author"
                        name="author"
                        value={form.author}
                        onChange={handleChange}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FloatingInput
                        label="Servings"
                        name="servings"
                        type="number"
                        value={form.servings}
                        onChange={handleChange}
                        min={1}
                        required
                    />
                    <select
                        name="difficulty"
                        value={form.difficulty}
                        onChange={handleChange}
                        className="border rounded p-2"
                    >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                    </select>
                </div>

                {/* Ingredients */}
                <section>
                    <h2 className="text-xl font-semibold mb-2">Ingredients</h2>
                    {form.ingredients.map((ing, i) => (
                        <div key={i} className="flex gap-2 mb-2 items-center">
                            <Input
                                placeholder="Item"
                                value={ing.item}
                                onChange={(e) => handleIngredientChange(i, "item", e.target.value)}
                                required
                                className="flex-1"
                            />
                            <Input
                                placeholder="Amount"
                                value={ing.amount}
                                onChange={(e) => handleIngredientChange(i, "amount", e.target.value)}
                                required
                                className="w-32"
                            />
                            <button
                                type="button"
                                onClick={() => removeIngredient(i)}
                                className="text-red-500 font-bold text-xl px-2 hover:text-red-700"
                                aria-label={`Remove ingredient ${i + 1}`}
                            >
                                &times;
                            </button>
                        </div>
                    ))}
                    <Button type="button" onClick={addIngredient} variant="outline">
                        + Add Ingredient
                    </Button>
                </section>

                {/* Steps */}
                <section>
                    <h2 className="text-xl font-semibold mb-2">Steps</h2>
                    {form.steps.map((step, i) => (
                        <div key={i} className="flex gap-2 mb-2 items-center">
                            <Textarea
                                placeholder={`Step ${i + 1}`}
                                value={step}
                                onChange={(e) => handleStepChange(i, e.target.value)}
                                required
                                rows={2}
                                className="flex-1"
                            />
                            <button
                                type="button"
                                onClick={() => removeStep(i)}
                                className="text-red-500 font-bold text-xl px-2 hover:text-red-700"
                                aria-label={`Remove step ${i + 1}`}
                            >
                                &times;
                            </button>
                        </div>
                    ))}
                    <Button type="button" onClick={addStep} variant="outline">
                        + Add Step
                    </Button>
                </section>

                <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full">
                    {submitting ? "Submitting..." : "Submit Recipe"}
                </Button>
                <Button
                    type="button"
                    onClick={() => router.push("/")}
                    className="w-full mt-4"
                    variant="secondary"
                >
                    Cancel
                </Button>
            </form>
        </div>
    );
}
