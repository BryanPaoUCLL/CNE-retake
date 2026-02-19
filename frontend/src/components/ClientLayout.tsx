"use client";

import React, { useState, useEffect } from "react";
import { AuthProvider } from "../context/AuthContext";
import Navbar from "./Navbar";
import Footer from "./Footer";
import AuthModal from "./AuthModal";
import SearchModal from "./SearchModal";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
	const [authModalOpen, setAuthModalOpen] = useState(false);
	const [searchModalOpen, setSearchModalOpen] = useState(false);

	// Global keyboard shortcut for search
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === "k") {
				e.preventDefault();
				setSearchModalOpen(true);
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	return (
		<AuthProvider>
			<div className="min-h-screen flex flex-col">
				<Navbar
					onSearchClick={() => setSearchModalOpen(true)}
					onLoginClick={() => setAuthModalOpen(true)}
				/>
				<main className="flex-1 pt-16">{children}</main>
				<Footer />
			</div>

			<AuthModal
				isOpen={authModalOpen}
				onClose={() => setAuthModalOpen(false)}
			/>
			<SearchModal
				isOpen={searchModalOpen}
				onClose={() => setSearchModalOpen(false)}
			/>
		</AuthProvider>
	);
}
