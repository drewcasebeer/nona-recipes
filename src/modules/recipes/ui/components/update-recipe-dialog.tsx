import { ResponseDialog } from "@/components/responsive-dialog";
import { RecipeForm } from "./recipe-form";
import { RecipeGetOneWithDetails } from "../../types";

interface UpdateRecipeDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	initialValues: RecipeGetOneWithDetails;
}

export const UpdateRecipeDialog = ({ open, onOpenChange, initialValues }: UpdateRecipeDialogProps) => {
	return (
		<ResponseDialog open={open} onOpenChange={onOpenChange} title="Edit Recipe" description="Edit the recipe details">
			<RecipeForm
				onSuccess={() => onOpenChange(false)}
				onCancel={() => onOpenChange(false)}
				initialValues={initialValues}
			/>
		</ResponseDialog>
	);
};
