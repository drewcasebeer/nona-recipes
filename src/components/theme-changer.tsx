"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Skeleton } from "./ui/skeleton";
import { DropdownMenuRadioGroup, DropdownMenuRadioItem } from "./ui/dropdown-menu";

const themes = [
	{ value: "system", label: "System" },
	{ value: "light", label: "Light" },
	{ value: "dark", label: "Dark" },
	{ value: "tangerine-light", label: "Tangerine - Light" },
	{ value: "tangerine-dark", label: "Tangerine - Dark" },
];

interface ThemeChangerProps {
	mobile?: boolean;
}

export const ThemeChanger = ({ mobile }: ThemeChangerProps) => {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		const savedTheme = localStorage.getItem("theme");
		if (savedTheme) {
			setTheme(savedTheme);
		}
	}, [setTheme]);

	// Prevents hydration mismatch
	if (!mounted) return <Skeleton className="w-16 h-8" />;

	const updateTheme = (value: string) => {
		setTheme(value);
	};

	if(mobile) {
		return (
			<div className="px-4 space-y-3">
				<div className="text-sm font-medium text-muted-foreground mb-2">Theme</div>
				<div className="grid grid-cols-1 gap-2">
					{themes.map(themeOption => (
						<button
							key={themeOption.value}
							onClick={() => updateTheme(themeOption.value)}
							className={`p-3 rounded-lg border text-left transition-colors ${
								theme === themeOption.value
									? "border-primary bg-primary/10 text-primary"
									: "border-border hover:bg-accent hover:text-accent-foreground"
							}`}
						>
							<div className="flex items-center justify-between">
								<span className="font-medium">{themeOption.label}</span>
								{theme === themeOption.value && (
									<div className="w-2 h-2 rounded-full bg-primary" />
								)}
							</div>
						</button>
					))}
				</div>
			</div>
		);
	}

	return (
		<DropdownMenuRadioGroup value={theme || "system"} onValueChange={updateTheme}>
			{themes.map(theme => (
				<DropdownMenuRadioItem key={theme.value} value={theme.value}>
					{theme.label}
				</DropdownMenuRadioItem>
			))}
		</DropdownMenuRadioGroup>
	);
};