"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../context/AuthContext";
import { Search, User, ShoppingBag, Plus, LogOut, Menu, X } from "lucide-react";

interface NavbarProps {
	onSearchClick?: () => void;
	onLoginClick?: () => void;
}

export default function Navbar({ onSearchClick, onLoginClick }: NavbarProps) {
	const { user, logout } = useAuth();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			setScrolled(window.scrollY > 20);
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<nav
			className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
				scrolled
					? "bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl shadow-sm shadow-zinc-200/50 dark:shadow-zinc-900/50"
					: "bg-transparent"
			}`}
		>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-20">
					{/* Logo */}
					<Link
						href="/"
						className="flex items-center gap-3 group"
					>
						<div className="relative w-10 h-10 transition-transform duration-300 group-hover:scale-105">
							<Image
								src="/logo/brandmark.png"
								alt="Galerique"
								fill
								className="object-contain"
								priority
							/>
						</div>
						<span className="font-[var(--font-bricolage)] font-extrabold text-xl tracking-tight text-zinc-900 dark:text-white hidden sm:block">
							Galerique
						</span>
					</Link>

					{/* Center Nav - Desktop */}
					<div className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
						<Link
							href="/"
							className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-sm font-medium transition-all duration-300 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 rounded-full"
						>
							Explore
						</Link>
						<Link
							href="/trending"
							className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-sm font-medium transition-all duration-300 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 rounded-full"
						>
							Trending
						</Link>
						<Link
							href="/about"
							className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-sm font-medium transition-all duration-300 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 rounded-full"
						>
							About
						</Link>
					</div>

					{/* Right side actions */}
					<div className="flex items-center gap-3">
						{/* Search button */}
						<button
							onClick={onSearchClick}
							className="p-2.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80 rounded-full transition-all duration-300"
							title="Search"
						>
							<Search size={20} />
						</button>

						{user ? (
							<>
								<Link
									href="/upload"
									className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all duration-300 hover:shadow-lg hover:shadow-zinc-900/20 dark:hover:shadow-white/20"
								>
									<Plus size={16} />
									Upload
								</Link>
								<Link
									href="/purchases"
									className="p-2.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80 rounded-full transition-all duration-300"
									title="My Collection"
								>
									<ShoppingBag size={20} />
								</Link>
								<Link
									href={`/profile/${user.id}`}
									className="p-2.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80 rounded-full transition-all duration-300"
									title="Profile"
								>
									<User size={20} />
								</Link>
								<button
									onClick={logout}
									className="p-2.5 text-zinc-600 dark:text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all duration-300"
									title="Sign out"
								>
									<LogOut size={20} />
								</button>
							</>
						) : (
							<>
								<button
									onClick={onLoginClick}
									className="hidden sm:block px-5 py-2.5 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white text-sm font-medium transition-all duration-300"
								>
									Sign in
								</button>
								<button
									onClick={onLoginClick}
									className="hidden sm:flex items-center px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all duration-300 hover:shadow-lg hover:shadow-zinc-900/20 dark:hover:shadow-white/20"
								>
									Get Started
								</button>
							</>
						)}

						{/* Mobile menu toggle */}
						<button
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
							className="lg:hidden p-2.5 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80 rounded-full transition-all duration-300"
						>
							{mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
						</button>
					</div>
				</div>
			</div>

			{/* Mobile menu */}
			<div
				className={`lg:hidden overflow-hidden transition-all duration-500 ease-out ${
					mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
				}`}
			>
				<div className="bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-200/50 dark:border-zinc-800/50 px-4 py-6">
					<div className="flex flex-col gap-1">
						<Link
							href="/"
							className="px-4 py-3 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl font-medium transition-colors"
							onClick={() => setMobileMenuOpen(false)}
						>
							Explore
						</Link>
						<Link
							href="/trending"
							className="px-4 py-3 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl font-medium transition-colors"
							onClick={() => setMobileMenuOpen(false)}
						>
							Trending
						</Link>
						<Link
							href="/about"
							className="px-4 py-3 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl font-medium transition-colors"
							onClick={() => setMobileMenuOpen(false)}
						>
							About
						</Link>
						{user ? (
							<>
								<div className="h-px bg-zinc-200 dark:bg-zinc-800 my-2" />
								<Link
									href="/purchases"
									className="px-4 py-3 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl font-medium transition-colors flex items-center gap-2"
									onClick={() => setMobileMenuOpen(false)}
								>
									<ShoppingBag size={16} />
									My Collection
								</Link>
								<Link
									href={`/profile/${user.id}`}
									className="px-4 py-3 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl font-medium transition-colors flex items-center gap-2"
									onClick={() => setMobileMenuOpen(false)}
								>
									<User size={16} />
									Profile
								</Link>
								<Link
									href="/upload"
									className="mt-2 px-4 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-center font-medium flex items-center justify-center gap-2"
									onClick={() => setMobileMenuOpen(false)}
								>
									<Plus size={16} />
									Upload Artwork
								</Link>
							</>
						) : (
							<>
								<div className="h-px bg-zinc-200 dark:bg-zinc-800 my-2" />
								<button
									onClick={() => {
										setMobileMenuOpen(false);
										onLoginClick?.();
									}}
									className="mt-2 px-4 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-center font-medium"
								>
									Get Started
								</button>
							</>
						)}
					</div>
				</div>
			</div>
		</nav>
	);
}
