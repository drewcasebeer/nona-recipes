import { RecipeIdView, RecipeIdViewError, RecipeIdViewLoading } from "@/modules/recipes/ui/views/recipe-id-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface Props {
	params: Promise<{ recipeId: string }>;
}

const Page = async ({ params }: Props) => {
	const { recipeId } = await params;

	const queryClient = getQueryClient();
	void queryClient.prefetchQuery(trpc.recipes.getOne.queryOptions({ id: recipeId }));

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<Suspense fallback={<RecipeIdViewLoading />}>
				<ErrorBoundary fallback={<RecipeIdViewError />}>
					<RecipeIdView recipeId={recipeId} />
				</ErrorBoundary>
			</Suspense>
		</HydrationBoundary>
	);
};

export default Page;
