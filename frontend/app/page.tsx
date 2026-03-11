"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { ArtworkSummaryDto, Page } from "../src/types";
import ArtworkService from "../src/services/artwork.service";
import ArtworkGrid from "../src/components/ArtworkGrid";
import { ArrowRight, Clock, TrendingUp } from "lucide-react";

type SortOption = "newest" | "popular" | "price-low" | "price-high";

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
			{ threshold: 0.08, rootMargin: "0px 0px -60px 0px" },
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, []);
	return ref;
}

export default function HomePage() {
	const [artworks, setArtworks] = useState<ArtworkSummaryDto[]>([]);
	const [featured, setFeatured] = useState<ArtworkSummaryDto[]>([]);
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

	const loadFeatured = useCallback(async () => {
		try {
			const res = await ArtworkService.list(0, 3, "views,desc");
			const data: Page<ArtworkSummaryDto> = await res.json();
			setFeatured(data.content);
		} catch {
			/* ignore */
		}
	}, []);

	const loadTrending = useCallback(async () => {
		try {
			const res = await ArtworkService.trending();
			const data = await res.json();
			setTrending(data.slice(0, 6));
		} catch {
			/* ignore */
		}
	}, []);

	useEffect(() => {
		loadArtworks(0, true);
		loadFeatured();
		loadTrending();
	}, [loadArtworks, loadFeatured, loadTrending]);

	const handleLike = async (id: number) => {
		try {
			await ArtworkService.like(id);
		} catch {
			/* ignore */
		}
	};

	const handleSortChange = (newSort: SortOption) => {
		if (newSort !== sort) {
			setSort(newSort);
			setPage(0);
		}
	};

	const heroRef = useReveal();
	const featuredRef = useReveal();
	const trendingRef = useReveal();
	const galleryRef = useReveal();

	const heroArtwork = featured[0];

	return (
		<div className="min-h-screen">
			{/* ===== Editorial Hero ===== */}
			<section
				ref={heroRef}
				className="reveal"
			>
				<div className="max-w-[1400px] mx-auto px-6 lg:px-10 pt-12 pb-24">
					{/* Label */}
					<div className="mb-12 animate-fade-in">
						<p className="tracking-editorial text-stone-400 dark:text-stone-600">Curated Gallery</p>
					</div>

					{heroArtwork ? (
						<Link
							href={`/artwork/${heroArtwork.id}`}
							className="group block"
						>
							<div className="grid lg:grid-cols-[1fr_420px] gap-10 lg:gap-16 items-end">
								{/* Hero image */}
								<div className="relative overflow-hidden rounded-lg bg-stone-100 dark:bg-stone-900 aspect-[16/10]">
									<img
										src={
											heroArtwork.thumbnailUrl ||
											heroArtwork.imageUrl ||
											"/logo/brandmark_squared.png"
										}
										alt={heroArtwork.title}
										className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.02]"
									/>
								</div>

								{/* Hero text */}
								<div className="lg:pb-4">
									<div className="editorial-line mb-6" />
									<h1 className="font-[var(--font-bricolage)] text-4xl sm:text-5xl lg:text-6xl font-bold text-stone-900 dark:text-stone-100 leading-[1.1] mb-6">
										{heroArtwork.title}
									</h1>
									<p className="text-stone-500 dark:text-stone-400 text-base mb-4">
										by {heroArtwork.creator?.username || "Unknown Artist"}
									</p>
									<div className="flex items-center gap-2 text-stone-400 dark:text-stone-500 text-sm group-hover:text-stone-600 dark:group-hover:text-stone-300 transition-colors duration-300">
										<span>View artwork</span>
										<ArrowRight
											size={14}
											strokeWidth={1.5}
											className="transition-transform duration-300 group-hover:translate-x-1"
										/>
									</div>
								</div>
							</div>
						</Link>
					) : (
						<div className="max-w-3xl">
							<h1 className="font-[var(--font-bricolage)] text-5xl sm:text-6xl lg:text-7xl font-bold text-stone-900 dark:text-stone-100 leading-[1.1] mb-8 animate-fade-in stagger-1">
								Discover
								<br />
								extraordinary art
							</h1>
							<p className="text-lg text-stone-500 dark:text-stone-400 max-w-xl animate-fade-in stagger-2">
								A curated collection of digital artworks from visionary artists worldwide.
							</p>
						</div>
					)}
				</div>
			</section>

			{/* ===== Featured Artworks ===== */}
			{featured.length > 1 && (
				<section
					ref={featuredRef}
					className="reveal border-t border-stone-200 dark:border-stone-800"
				>
					<div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-24">
						<div className="flex items-center justify-between mb-12">
							<div>
								<p className="tracking-editorial text-stone-400 dark:text-stone-600 mb-3">Featured</p>
								<h2 className="font-[var(--font-bricolage)] text-2xl font-semibold text-stone-900 dark:text-stone-100">
									Editor&apos;s Selection
								</h2>
							</div>
						</div>

						<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
							{featured.slice(0, 3).map((artwork) => (
								<Link
									key={artwork.id}
									href={`/artwork/${artwork.id}`}
									className="group block"
								>
									<div className="relative overflow-hidden rounded-lg bg-stone-100 dark:bg-stone-900 aspect-[4/5]">
										<img
											src={
												artwork.thumbnailUrl ||
												artwork.imageUrl ||
												"/logo/brandmark_squared.png"
											}
											alt={artwork.title}
											className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
										/>
										<div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
									</div>
									<div className="mt-4">
										<h3 className="text-sm font-medium text-stone-800 dark:text-stone-200 group-hover:text-stone-500 transition-colors duration-300">
											{artwork.title}
										</h3>
										<p className="text-xs text-stone-500 dark:text-stone-500 mt-1">
											{artwork.creator?.username || "Unknown"}
										</p>
									</div>
								</Link>
							))}
						</div>
					</div>
				</section>
			)}

			{/* ===== Trending ===== */}
			{trending.length > 0 && (
				<section
					ref={trendingRef}
					className="reveal border-t border-stone-200 dark:border-stone-800 bg-stone-100/50 dark:bg-stone-900/30"
				>
					<div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-24">
						<div className="flex items-center justify-between mb-12">
							<div>
								<p className="tracking-editorial text-stone-400 dark:text-stone-600 mb-3">Trending</p>
								<h2 className="font-[var(--font-bricolage)] text-2xl font-semibold text-stone-900 dark:text-stone-100">
									Most Viewed
								</h2>
							</div>
							<Link
								href="/trending"
								className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors duration-300"
							>
								View all
								<ArrowRight
									size={14}
									strokeWidth={1.5}
								/>
							</Link>
						</div>

						<div className="grid grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
							{trending.slice(0, 6).map((artwork, i) => (
								<Link
									key={artwork.id}
									href={`/artwork/${artwork.id}`}
									className="group block"
								>
									<div className="relative overflow-hidden rounded-lg bg-stone-200 dark:bg-stone-800 aspect-[4/3]">
										<img
											src={
												artwork.thumbnailUrl ||
												artwork.imageUrl ||
												"/logo/brandmark_squared.png"
											}
											alt={artwork.title}
											className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
										/>
										{/* Rank indicator */}
										<div className="absolute top-3 left-3 w-7 h-7 rounded-full bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm flex items-center justify-center text-xs font-semibold text-stone-700 dark:text-stone-300">
											{i + 1}
										</div>
									</div>
									<div className="mt-3">
										<h3 className="text-sm font-medium text-stone-800 dark:text-stone-200 line-clamp-1">
											{artwork.title}
										</h3>
										<p className="text-xs text-stone-400 dark:text-stone-500 mt-1">
											{artwork.views?.toLocaleString() || 0} views
										</p>
									</div>
								</Link>
							))}
						</div>
					</div>
				</section>
			)}

			{/* ===== Gallery Section ===== */}
			<section
				ref={galleryRef}
				id="gallery"
				className="reveal border-t border-stone-200 dark:border-stone-800"
			>
				<div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-24">
					<div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
						<div>
							<p className="tracking-editorial text-stone-400 dark:text-stone-600 mb-3">Browse</p>
							<h2 className="font-[var(--font-bricolage)] text-2xl font-semibold text-stone-900 dark:text-stone-100">
								All Artworks
							</h2>
						</div>

						{/* Sort */}
						<div className="flex items-center gap-1 border border-stone-200 dark:border-stone-800 rounded-full p-1">
							{[
								{ key: "newest", label: "Recent", icon: Clock },
								{ key: "popular", label: "Popular", icon: TrendingUp },
							].map(({ key, label, icon: Icon }) => (
								<button
									key={key}
									onClick={() => handleSortChange(key as SortOption)}
									className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 ${
										sort === key
											? "bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900"
											: "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
									}`}
								>
									<Icon
										size={12}
										strokeWidth={1.5}
									/>
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
						<div className="flex justify-center mt-20">
							<button
								onClick={() => loadArtworks(page + 1)}
								className="px-8 py-3 border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-400 rounded-full text-sm font-medium hover:border-stone-900 dark:hover:border-stone-100 hover:text-stone-900 dark:hover:text-stone-100 transition-all duration-300"
							>
								Load more
							</button>
						</div>
					)}

					{loading && artworks.length > 0 && (
						<div className="flex justify-center mt-20">
							<div className="w-8 h-8 border border-stone-300 dark:border-stone-700 border-t-stone-900 dark:border-t-stone-100 rounded-full animate-spin" />
						</div>
					)}
				</div>
			</section>
		</div>
	);
}
