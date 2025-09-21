"use client";

import { Featured } from "@/modules/recipes/ui/components/featured";
import { HomeHero } from "../components/home-hero";

export const HomeView = () => {
	return (
		<>
			<HomeHero />
			<Featured />
		</>
	);
};
