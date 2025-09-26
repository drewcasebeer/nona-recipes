import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TRPCReactProvider } from "@/trpc/client";
import { Toaster } from "@/components/ui/sonner";
import { NuqsAdapter } from "nuqs/adapters/next";
import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@vercel/analytics/next";


const inter = Inter({
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Nona's Recipes",
	description: "Recipe's from Nona's Kitchen",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<NuqsAdapter>
			<TRPCReactProvider>
				<html lang="en" suppressHydrationWarning>
					<body className={`${inter.className} antialiased`}>
						<ThemeProvider attribute="class" defaultTheme="system" themes={['light', 'dark', 'system', 'tangerine-light', 'tangerine-dark']} enableSystem disableTransitionOnChange>
							<Toaster />
							{children}
							<Analytics />
						</ThemeProvider>
					</body>
				</html>
			</TRPCReactProvider>
		</NuqsAdapter>
	);
}
