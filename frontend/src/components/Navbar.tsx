"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { Search, User, ShoppingBag, Plus, LogOut, Menu, X, Flame } from "lucide-react";

interface NavbarProps {
	onSearchClick?: () => void;
	onLoginClick?: () => void;
}

export default function Navbar({ onSearchClick, onLoginClick }: NavbarProps) {
	const { user, logout } = useAuth();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	return (
		<nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					{/* Logo */}
					<Link
						href="/"
						className="flex items-center gap-2"
					>
						<div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center">
							<span className="text-white font-bold text-sm">A</span>
						</div>
						<span className="font-semibold text-lg text-zinc-900 dark:text-white hidden sm:block">
							Arty
						</span>
					</Link>

					{/* Nav Links - Desktop */}
					<div className="hidden md:flex items-center gap-1">
						<Link
							href="/trending"
							className="flex items-center gap-1.5 px-3 py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-sm font-medium transition-colors"
						>
							<Flame size={16} />
							Trending
						</Link>
					</div>

					{/* Search Bar - Desktop */}
					<button
						onClick={onSearchClick}
						className="hidden sm:flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors w-64 lg:w-80"
					>
						<Search size={18} />
						<span className="text-sm">Search artworks...</span>
						<kbd className="ml-auto text-xs bg-zinc-200 dark:bg-zinc-700 px-1.5 py-0.5 rounded">⌘K</kbd>
					</button>

					{/* Right side actions */}
					<div className="flex items-center gap-2">
						{/* Mobile search */}
						<button
							onClick={onSearchClick}
							className="sm:hidden p-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full"
						>
							<Search size={20} />
						</button>

						{user ? (
							<>
								<Link
									href="/upload"
									className="hidden sm:flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
								>
									<Plus size={16} />
									Upload
								</Link>
								<Link
									href="/purchases"
									className="p-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full"
									title="My Purchases"
								>
									<ShoppingBag size={20} />
								</Link>
								<Link
									href={`/profile/${user.id}`}
									className="p-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full"
									title="Profile"
								>
									<User size={20} />
								</Link>
								<button
									onClick={logout}
									className="p-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full"
									title="Log out"
								>
									<LogOut size={20} />
								</button>
							</>
						) : (
							<>
								<button
									onClick={onLoginClick}
									className="px-4 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-sm font-medium transition-colors"
								>
									Log in
								</button>
								<button
									onClick={onLoginClick}
									className="hidden sm:block px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
								>
									Sign up
								</button>
							</>
						)}

						{/* Mobile menu toggle */}
						<button
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
							className="sm:hidden p-2 text-zinc-600 dark:text-zinc-400"
						>
							{mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
						</button>
					</div>
				</div>
			</div>

			{/* Mobile menu */}
			{mobileMenuOpen && (
				<div className="sm:hidden bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 px-4 py-4">
					<div className="flex flex-col gap-2">
						<Link
							href="/"
							className="px-4 py-3 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
							onClick={() => setMobileMenuOpen(false)}
						>
							Explore
						</Link>
						<Link
							href="/trending"
							className="px-4 py-3 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
							onClick={() => setMobileMenuOpen(false)}
						>
							Trending
						</Link>
						{user && (
							<>
								<Link
									href="/purchases"
									className="px-4 py-3 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
									onClick={() => setMobileMenuOpen(false)}
								>
									My Purchases
								</Link>
								<Link
									href={`/profile/${user.id}`}
									className="px-4 py-3 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
									onClick={() => setMobileMenuOpen(false)}
								>
									Profile
								</Link>
								<Link
									href="/upload"
									className="px-4 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-center font-medium"
									onClick={() => setMobileMenuOpen(false)}
								>
									Upload Artwork
								</Link>
							</>
						)}
					</div>
				</div>
			)}
		</nav>
	);
}
