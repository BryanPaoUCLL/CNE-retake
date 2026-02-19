import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "../src/components/ClientLayout";
import { SettingsProvider } from "../src/context/SettingsContext";

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: { template: "%s | Arty", default: "Arty - Digital Art Gallery" },
	description: "Discover and collect extraordinary digital art from artists around the world.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
		>
			<body className={`${inter.variable} font-sans antialiased bg-white dark:bg-zinc-950`}>
				<SettingsProvider>
					<ClientLayout>{children}</ClientLayout>
				</SettingsProvider>
			</body>
		</html>
	);
}
