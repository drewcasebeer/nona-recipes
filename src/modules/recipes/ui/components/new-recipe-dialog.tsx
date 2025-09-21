import { ResponseDialog } from "@/components/responsive-dialog";
import { RecipeForm } from "./recipe-form";

interface NewRecipeDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export const NewRecipeDialog = ({ open, onOpenChange }: NewRecipeDialogProps) => {
	return (
		<ResponseDialog open={open} onOpenChange={onOpenChange} title="New Recipe" description="Create a new recipe">
			<RecipeForm onSuccess={() => onOpenChange(false)} onCancel={() => onOpenChange(false)} />
		</ResponseDialog>
	);
};
