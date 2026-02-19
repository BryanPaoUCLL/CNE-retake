import type { Metadata } from "next";
import { Inter, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import ClientLayout from "../src/components/ClientLayout";
import { SettingsProvider } from "../src/context/SettingsContext";

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
	variable: "--font-bricolage",
	subsets: ["latin"],
	weight: ["200", "300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
	title: { template: "%s | Galerique", default: "Galerique - Luxury Digital Art Gallery" },
	description: "Discover, collect and trade extraordinary digital art from visionary artists around the world.",
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
			<body className={`${inter.variable} ${bricolage.variable} font-sans antialiased bg-white dark:bg-zinc-950`}>
				<SettingsProvider>
					<ClientLayout>{children}</ClientLayout>
				</SettingsProvider>
			</body>
		</html>
	);
}
