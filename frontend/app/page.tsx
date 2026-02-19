"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { ArtworkSummaryDto, Page } from "../src/types";
import ArtworkService from "../src/services/artwork.service";
import ArtworkGrid from "../src/components/ArtworkGrid";
import { TrendingUp, Sparkles, Clock } from "lucide-react";

type SortOption = "newest" | "popular" | "price-low" | "price-high";

/* Scroll-reveal hook */
function useReveal() {
	const ref = useRef<HTMLElement>(null);
	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					el.classList.add("visible");
					observer.unobserve(el);
				}
			},
			{ threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, []);
	return ref;
}

export default function HomePage() {
	const [artworks, setArtworks] = useState<ArtworkSummaryDto[]>([]);
	const [trending, setTrending] = useState<ArtworkSummaryDto[]>([]);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(0);
	const [hasMore, setHasMore] = useState(true);
	const [sort, setSort] = useState<SortOption>("newest");

	const getSortParam = (s: SortOption) => {
		switch (s) {
			case "newest":
				return "createdAt,desc";
			case "popular":
				return "views,desc";
			case "price-low":
				return "price,asc";
			case "price-high":
				return "price,desc";
			default:
				return undefined;
		}
	};

	const loadArtworks = useCallback(
		async (pageNum: number, reset = false) => {
			setLoading(true);
			try {
				const res = await ArtworkService.list(pageNum, 12, getSortParam(sort));
				const data: Page<ArtworkSummaryDto> = await res.json();
				setArtworks((prev) => (reset ? data.content : [...prev, ...data.content]));
				setHasMore(!data.last);
				setPage(data.number);
			} catch (err) {
				console.error("Failed to load artworks", err);
			} finally {
				setLoading(false);
			}
		},
		[sort],
	);

	const loadTrending = useCallback(async () => {
		try {
			const res = await ArtworkService.trending();
			const data = await res.json();
			setTrending(data.slice(0, 4));
		} catch {
			// ignore
		}
	}, []);

	useEffect(() => {
		loadArtworks(0, true);
		loadTrending();
	}, [loadArtworks, loadTrending]);

	const handleLike = async (id: number) => {
		try {
			await ArtworkService.like(id);
		} catch {
			// user might not be logged in
		}
	};

	const handleSortChange = (newSort: SortOption) => {
		if (newSort !== sort) {
			setSort(newSort);
			setPage(0);
		}
	};

	const trendingRef = useReveal();
	const galleryRef = useReveal();

	return (
		<div className="min-h-screen">
			{/* Hero Section */}
			<section className="relative overflow-hidden bg-zinc-50 dark:bg-zinc-950">
				{/* Background decoration */}
				<div className="absolute inset-0 opacity-40 dark:opacity-20">
					<div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-amber-200 to-rose-200 dark:from-amber-900/30 dark:to-rose-900/30 rounded-full blur-3xl animate-pulse-glow" />
					<div
						className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-violet-200 to-cyan-200 dark:from-violet-900/30 dark:to-cyan-900/30 rounded-full blur-3xl animate-pulse-glow"
						style={{ animationDelay: "2s" }}
					/>
				</div>

				<div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
					<div className="text-center max-w-4xl mx-auto">
						<div className="animate-fade-in">
							<span className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-full text-sm text-zinc-600 dark:text-zinc-400 mb-6 border border-zinc-200 dark:border-zinc-800">
								<Sparkles
									size={14}
									className="text-amber-500"
								/>
								<span>The Luxury Digital Art Gallery</span>
							</span>
						</div>
						<h1 className="font-[var(--font-bricolage)] text-5xl sm:text-6xl lg:text-7xl font-extrabold text-zinc-900 dark:text-white leading-[1.1] animate-fade-in stagger-1">
							Discover{" "}
							<span className="bg-gradient-to-r from-amber-600 via-rose-600 to-violet-600 bg-clip-text text-transparent">
								Extraordinary
							</span>{" "}
							Art
						</h1>
						<p className="mt-8 text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto animate-fade-in stagger-2">
							Explore a curated collection of stunning digital artworks from visionary artists worldwide.
							Find your next masterpiece.
						</p>
						<div className="mt-10 flex flex-wrap items-center justify-center gap-4 animate-fade-in stagger-3">
							<a
								href="#gallery"
								className="px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all duration-300 hover:shadow-xl hover:shadow-zinc-900/20 dark:hover:shadow-white/10"
							>
								Explore Gallery
							</a>
							<a
								href="/trending"
								className="px-8 py-4 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-full font-medium border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300"
							>
								View Trending
							</a>
						</div>
					</div>
				</div>
			</section>

			{/* Gallery Section */}
			<section
				ref={galleryRef}
				id="gallery"
				className="reveal max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
			>
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
					<div className="flex items-center gap-3">
						<h2 className="font-[var(--font-bricolage)] text-2xl font-bold text-zinc-900 dark:text-white">
							All Artworks
						</h2>
					</div>

					{/* Sort tabs */}
					<div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 rounded-full p-1.5 border border-zinc-200 dark:border-zinc-800">
						{[
							{ key: "newest", label: "Newest", icon: Clock },
							{ key: "popular", label: "Popular", icon: TrendingUp },
						].map(({ key, label, icon: Icon }) => (
							<button
								key={key}
								onClick={() => handleSortChange(key as SortOption)}
								className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
									sort === key
										? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm"
										: "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
								}`}
							>
								<Icon size={14} />
								{label}
							</button>
						))}
					</div>
				</div>

				<ArtworkGrid
					artworks={artworks}
					onLike={handleLike}
					loading={loading && artworks.length === 0}
				/>

				{/* Load more */}
				{hasMore && !loading && artworks.length > 0 && (
					<div className="flex justify-center mt-16">
						<button
							onClick={() => loadArtworks(page + 1)}
							className="px-10 py-4 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-full font-medium border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 hover:shadow-lg"
						>
							Load more artworks
						</button>
					</div>
				)}

				{loading && artworks.length > 0 && (
					<div className="flex justify-center mt-16">
						<div className="w-10 h-10 border-2 border-zinc-300 dark:border-zinc-700 border-t-zinc-900 dark:border-t-white rounded-full animate-spin" />
					</div>
				)}
			</section>
		</div>
	);
}
