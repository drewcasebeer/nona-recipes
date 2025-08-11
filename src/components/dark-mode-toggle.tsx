"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useEffect, useState } from "react";

export const DarkModeToggle = () => {
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
	if (!mounted) return null;

	const updateTheme = (value: string) => {
		setTheme(value);
	};

	return (
		<Select onValueChange={updateTheme} defaultValue={theme}>
			<SelectTrigger>
				<SelectValue placeholder="Theme" />
			</SelectTrigger>

			<SelectContent>
				<SelectItem value="light">Light</SelectItem>
				<SelectItem value="dark">Dark</SelectItem>
				<SelectItem value="system">System</SelectItem>
				<SelectItem value="tangerine-light">Tangerine - Light</SelectItem>
				<SelectItem value="tangerine-dark">Tangerine - Dark</SelectItem>
			</SelectContent>
		</Select>

		// <Button
		// 	onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
		// 	className="p-2 rounded-md hover:bg-accent transition"
		// 	variant="ghost"
		// 	aria-label="Toggle Dark Mode"
		// >
		// 	{theme === "dark" ? <Sun className="size-5 text-yellow-400" /> : <Moon className="size-5 text-gray-800" />}
		// </Button>
	);
}