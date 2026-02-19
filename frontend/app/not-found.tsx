"use client";
import Link from "next/link";
import Image from "next/image";
import React from "react";

export default function NotFound() {
	return (
		<div className="min-h-screen bg-white dark:bg-zinc-950 relative overflow-hidden">
			{/* Ambient background */}
			<div className="absolute inset-0 pointer-events-none">
				<div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-b from-zinc-100 dark:from-zinc-900/50 to-transparent rounded-full blur-3xl opacity-60" />
				<div className="absolute bottom-0 left-1/4 w-96 h-96 bg-gradient-to-r from-amber-100/40 to-rose-100/40 dark:from-amber-900/10 dark:to-rose-900/10 rounded-full blur-3xl" />
				<div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-violet-100/30 to-cyan-100/30 dark:from-violet-900/10 dark:to-cyan-900/10 rounded-full blur-3xl" />
			</div>

			{/* Grid pattern overlay */}
			<div
				className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03] pointer-events-none"
				style={{
					backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
					backgroundSize: "60px 60px",
				}}
			/>

			<div className="relative flex flex-col items-center justify-center min-h-screen px-6">
				{/* Logo */}
				<div className="mb-12 animate-fade-in">
					<Link
						href="/"
						className="opacity-40 hover:opacity-70 transition-opacity duration-500"
					>
						<Image
							src="/logo/brandmark.png"
							alt="Galerique"
							width={48}
							height={48}
							className="dark:invert"
						/>
					</Link>
				</div>

				{/* 404 number - large typographic element */}
				<div className="animate-fade-in">
					<h1 className="font-[var(--font-bricolage)] text-[12rem] sm:text-[16rem] lg:text-[20rem] font-black leading-none tracking-tighter text-zinc-100 dark:text-zinc-900 select-none">
						404
					</h1>
				</div>

				{/* Content overlay */}
				<div className="absolute inset-0 flex flex-col items-center justify-center px-6">
					<div className="mt-8 text-center max-w-lg animate-fade-in stagger-1">
						<p className="text-sm uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-600 mb-4 font-medium">
							Page not found
						</p>
						<h2 className="font-[var(--font-bricolage)] text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-900 dark:text-white mb-6">
							Lost in the gallery
						</h2>
						<p className="text-zinc-500 dark:text-zinc-400 text-lg leading-relaxed mb-10">
							The page you&apos;re looking for has been moved, removed, or perhaps never existed.
							Let&apos;s get you back to the art.
						</p>

						<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
							<Link
								href="/"
								className="px-8 py-3.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all duration-300 hover:shadow-lg hover:shadow-zinc-900/20 dark:hover:shadow-white/20"
							>
								Back to Gallery
							</Link>
							<Link
								href="/about"
								className="px-8 py-3.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-sm font-medium transition-all duration-300"
							>
								About Galerique
							</Link>
						</div>
					</div>
				</div>

				{/* Decorative line */}
				<div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-zinc-300 dark:from-zinc-700 to-transparent animate-fade-in stagger-2" />

				{/* Bottom text */}
				<div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-fade-in stagger-3">
					<p className="text-xs text-zinc-400 dark:text-zinc-600 tracking-widest uppercase">
						Galerique &mdash; Digital Art Gallery
					</p>
				</div>
			</div>
		</div>
	);
}
