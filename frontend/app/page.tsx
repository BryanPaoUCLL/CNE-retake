"use client";

import React, { useEffect, useState, useCallback } from "react";
import { ArtworkSummaryDto, Page } from "../src/types";
import ArtworkService from "../src/services/artwork.service";
import ArtworkGrid from "../src/components/ArtworkGrid";
import { TrendingUp, Sparkles, Clock } from "lucide-react";

type SortOption = "newest" | "popular" | "price-low" | "price-high";

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

	return (
		<div className="min-h-screen">
			{/* Hero Section */}
			<section className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
					<div className="text-center max-w-3xl mx-auto">
						<h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-zinc-900 dark:text-white leading-tight">
							Discover{" "}
							<span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
								extraordinary
							</span>{" "}
							digital art
						</h1>
						<p className="mt-6 text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
							Explore a curated collection of stunning digital artworks from talented artists around the
							world. Find your next masterpiece.
						</p>
						<div className="mt-8 flex flex-wrap items-center justify-center gap-4">
							<a
								href="#gallery"
								className="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
							>
								Explore Gallery
							</a>
							<a
								href="/trending"
								className="px-6 py-3 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-full font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
							>
								View Trending
							</a>
						</div>
					</div>
				</div>

				{/* Background decoration */}
				<div className="absolute top-0 left-1/4 w-72 h-72 bg-violet-200 dark:bg-violet-900/20 rounded-full blur-3xl opacity-50" />
				<div className="absolute bottom-0 right-1/4 w-72 h-72 bg-fuchsia-200 dark:bg-fuchsia-900/20 rounded-full blur-3xl opacity-50" />
			</section>

			{/* Trending Section */}
			{trending.length > 0 && (
				<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
					<div className="flex items-center gap-2 mb-8">
						<TrendingUp
							className="text-violet-500"
							size={24}
						/>
						<h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Trending Now</h2>
					</div>
					<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
						{trending.map((artwork, i) => (
							<a
								key={artwork.id}
								href={`/artwork/${artwork.id}`}
								className="group relative aspect-square rounded-2xl overflow-hidden"
							>
								<img
									src={artwork.imageUrl || "/placeholder.jpg"}
									alt={artwork.title}
									className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
								<div className="absolute top-3 left-3 w-8 h-8 bg-white/90 dark:bg-zinc-800/90 rounded-full flex items-center justify-center text-sm font-bold text-zinc-900 dark:text-white">
									{i + 1}
								</div>
								<div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
									<p className="text-white font-medium truncate">{artwork.title}</p>
								</div>
							</a>
						))}
					</div>
				</section>
			)}

			{/* Gallery Section */}
			<section
				id="gallery"
				className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
			>
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
					<div className="flex items-center gap-2">
						<Sparkles
							className="text-violet-500"
							size={24}
						/>
						<h2 className="text-2xl font-bold text-zinc-900 dark:text-white">All Artworks</h2>
					</div>

					{/* Sort tabs */}
					<div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-full p-1">
						{[
							{ key: "newest", label: "Newest", icon: Clock },
							{ key: "popular", label: "Popular", icon: TrendingUp },
						].map(({ key, label, icon: Icon }) => (
							<button
								key={key}
								onClick={() => handleSortChange(key as SortOption)}
								className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
									sort === key
										? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
										: "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
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
					<div className="flex justify-center mt-12">
						<button
							onClick={() => loadArtworks(page + 1)}
							className="px-8 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-full font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
						>
							Load more
						</button>
					</div>
				)}

				{loading && artworks.length > 0 && (
					<div className="flex justify-center mt-12">
						<div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
					</div>
				)}
			</section>
		</div>
	);
}
