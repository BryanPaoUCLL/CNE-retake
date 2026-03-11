"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { ArtworkSummaryDto, Page } from "../src/types";
import ArtworkService from "../src/services/artwork.service";
import ArtworkGrid from "../src/components/ArtworkGrid";
import { ArrowRight, Clock, TrendingUp, Search, X, Sparkles } from "lucide-react";

type SortOption = "newest" | "popular";
type DisplayMode = "list" | "search" | "tag";

const POPULAR_TAGS = [
	"abstract",
	"portrait",
	"landscape",
	"digital",
	"oil",
	"watercolor",
	"photography",
	"minimal",
	"surreal",
	"contemporary",
];

const getSortParam = (s: SortOption) => (s === "newest" ? "createdAt,desc" : "views,desc");

export default function HomePage() {
	const [artworks, setArtworks] = useState<ArtworkSummaryDto[]>([]);
	const [trending, setTrending] = useState<ArtworkSummaryDto[]>([]);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(0);
	const [hasMore, setHasMore] = useState(true);
	const [sort, setSort] = useState<SortOption>("newest");
	const [displayMode, setDisplayMode] = useState<DisplayMode>("list");
	const [transitionClass, setTransitionClass] = useState("");
	const [searchInput, setSearchInput] = useState("");
	const [activeQuery, setActiveQuery] = useState("");
	const [selectedTag, setSelectedTag] = useState<string | null>(null);
	const searchRef = useRef<HTMLInputElement>(null);

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
			setTrending(data.slice(0, 5));
		} catch {
			/* ignore */
		}
	}, []);

	const loadSearch = useCallback(async (query: string) => {
		setLoading(true);
		try {
			const res = await ArtworkService.search(query);
			const data: ArtworkSummaryDto[] = await res.json();
			setArtworks(data);
			setHasMore(false);
		} catch {
			setArtworks([]);
		} finally {
			setLoading(false);
		}
	}, []);

	const loadByTag = useCallback(async (tag: string) => {
		setLoading(true);
		try {
			const res = await ArtworkService.searchByTag(tag);
			const data: ArtworkSummaryDto[] = await res.json();
			setArtworks(data);
			setHasMore(false);
		} catch {
			setArtworks([]);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadArtworks(0, true);
		loadTrending();
	}, [loadArtworks, loadTrending]);

	useEffect(() => {
		if (displayMode === "list") {
			loadArtworks(0, true);
		}
	}, [sort, displayMode, loadArtworks]);

	const handleSearch = () => {
		const q = searchInput.trim();
		if (!q) return;
		setActiveQuery(q);
		setSelectedTag(null);
		setDisplayMode("search");
		loadSearch(q);
	};

	const handleTagSelect = (tag: string) => {
		if (selectedTag === tag) {
			clearFilters();
			return;
		}
		setSelectedTag(tag);
		setActiveQuery("");
		setSearchInput("");
		setDisplayMode("tag");
		loadByTag(tag);
	};

	const clearFilters = () => {
		setSearchInput("");
		setActiveQuery("");
		setSelectedTag(null);
		setDisplayMode("list");
	};

	const handleSortChange = (newSort: SortOption) => {
		if (newSort === sort) return;
		if (displayMode !== "list") clearFilters();
		setTransitionClass(newSort === "popular" ? "animate-slide-in-right" : "animate-slide-in-left");
		setTimeout(() => setTransitionClass(""), 500);
		setSort(newSort);
	};

	const handleLike = async (id: number) => {
		try {
			await ArtworkService.like(id);
		} catch {
			/* ignore */
		}
	};

	// Tab slider logic
	const tabIndex = sort === "newest" ? 0 : 1;

	return (
		<div className="min-h-screen">
			{/* ===== Hero Header ===== */}
			<div className="max-w-[1400px] mx-auto px-6 lg:px-10 pt-14 pb-10">
				<div className="animate-fade-in">
					<p className="tracking-editorial text-stone-400 dark:text-stone-500 mb-3">Curated Collection</p>
					<h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-stone-900 dark:text-stone-100 leading-[1.1] mb-8 animate-fade-in-up stagger-1">
						Discover
						<br className="hidden sm:block" /> extraordinary art
					</h1>
				</div>

				{/* Search bar */}
				<div className="relative max-w-2xl animate-fade-in stagger-2">
					<Search
						size={15}
						strokeWidth={1.5}
						className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
					/>
					<input
						ref={searchRef}
						type="text"
						placeholder="Search artworks and artists…"
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && handleSearch()}
						className="w-full pl-11 pr-28 py-3.5 rounded-full border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm placeholder:text-stone-400 focus:outline-none focus:border-stone-500 dark:focus:border-stone-500 transition-colors duration-200"
					/>
					{searchInput ? (
						<button
							onClick={clearFilters}
							className="absolute right-14 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
						>
							<X
								size={14}
								strokeWidth={1.5}
							/>
						</button>
					) : null}
					<button
						onClick={handleSearch}
						className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-full text-xs font-medium hover:bg-stone-700 dark:hover:bg-stone-300 transition-colors duration-200"
					>
						Search
					</button>
				</div>

				{/* Tag chips */}
				<div className="flex flex-wrap gap-2 mt-5 animate-fade-in stagger-3">
					{POPULAR_TAGS.map((tag) => (
						<button
							key={tag}
							onClick={() => handleTagSelect(tag)}
							className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 capitalize ${
								selectedTag === tag
									? "bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-sm"
									: "border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:border-stone-400 dark:hover:border-stone-600 hover:text-stone-900 dark:hover:text-stone-100"
							}`}
						>
							{tag}
						</button>
					))}
				</div>
			</div>

			{/* ===== Trending strip ===== */}
			{trending.length > 0 && displayMode === "list" && (
				<div className="border-t border-stone-100 dark:border-stone-900 bg-stone-50 dark:bg-stone-950">
					<div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-6">
						<div className="flex items-center gap-4 overflow-x-auto pb-1 scrollbar-none">
							<div className="flex items-center gap-2 shrink-0">
								<Sparkles
									size={13}
									strokeWidth={1.5}
									className="text-stone-400"
								/>
								<span className="tracking-editorial text-stone-400 dark:text-stone-600 text-[10px]">
									Trending
								</span>
							</div>
							{trending.map((artwork, i) => (
								<Link
									key={artwork.id}
									href={`/artwork/${artwork.id}`}
									className="group flex items-center gap-3 shrink-0 pr-4 border-r border-stone-200 dark:border-stone-800 last:border-0"
								>
									<div className="relative w-10 h-10 rounded-md overflow-hidden bg-stone-200 dark:bg-stone-800 shrink-0">
										<img
											src={
												artwork.thumbnailUrl ||
												artwork.imageUrl ||
												"/logo/brandmark_squared.png"
											}
											alt={artwork.title}
											className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
										/>
										<div className="absolute top-0 left-0 w-4 h-4 bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm flex items-center justify-center text-[8px] font-bold text-stone-600 dark:text-stone-300 rounded-br-md">
											{i + 1}
										</div>
									</div>
									<div>
										<p className="text-xs font-medium text-stone-700 dark:text-stone-300 line-clamp-1 group-hover:text-stone-500 transition-colors max-w-[120px]">
											{artwork.title}
										</p>
										<p className="text-[10px] text-stone-400 dark:text-stone-600">
											{artwork.views?.toLocaleString()} views
										</p>
									</div>
								</Link>
							))}
							<Link
								href="/trending"
								className="flex items-center gap-1 shrink-0 text-xs text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors ml-2"
							>
								See all
								<ArrowRight
									size={11}
									strokeWidth={1.5}
								/>
							</Link>
						</div>
					</div>
				</div>
			)}

			{/* ===== Gallery Section ===== */}
			<section className="border-t border-stone-200 dark:border-stone-800">
				<div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10">
					{/* Section header */}
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
						<div className="flex items-center gap-3 min-h-[36px]">
							{displayMode === "search" && activeQuery && (
								<>
									<span className="text-sm text-stone-600 dark:text-stone-400">
										Results for{" "}
										<span className="font-medium text-stone-900 dark:text-stone-100">
											&ldquo;{activeQuery}&rdquo;
										</span>
									</span>
									<button
										onClick={clearFilters}
										className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
									>
										<X
											size={12}
											strokeWidth={1.5}
										/>
										Clear
									</button>
								</>
							)}
							{displayMode === "tag" && selectedTag && (
								<>
									<span className="text-sm text-stone-600 dark:text-stone-400">
										Tag:{" "}
										<span className="font-medium text-stone-900 dark:text-stone-100 capitalize">
											{selectedTag}
										</span>
									</span>
									<button
										onClick={clearFilters}
										className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
									>
										<X
											size={12}
											strokeWidth={1.5}
										/>
										Clear
									</button>
								</>
							)}
							{displayMode === "list" && (
								<p className="tracking-editorial text-stone-400 dark:text-stone-600 text-[11px]">
									All Artworks
								</p>
							)}
						</div>

						{/* Animated Recent / Popular switcher — only in list mode */}
						{displayMode === "list" && (
							<div className="relative flex items-center gap-0 border border-stone-200 dark:border-stone-800 rounded-full p-1 self-start sm:self-auto">
								{/* Sliding pill */}
								<div
									className="absolute top-1 bottom-1 rounded-full bg-stone-900 dark:bg-stone-100 transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
									style={{
										width: "calc(50% - 4px)",
										left: tabIndex === 0 ? "4px" : "calc(50%)",
									}}
								/>
								{(
									[
										{ key: "newest", label: "Recent", icon: Clock },
										{ key: "popular", label: "Popular", icon: TrendingUp },
									] as const
								).map(({ key, label, icon: Icon }, idx) => (
									<button
										key={key}
										onClick={() => handleSortChange(key)}
										className={`relative z-10 flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-medium transition-colors duration-300 ${
											sort === key
												? "text-white dark:text-stone-900"
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
						)}
					</div>

					<div className={transitionClass}>
						<ArtworkGrid
							artworks={artworks}
							onLike={handleLike}
							loading={loading && artworks.length === 0}
						/>
					</div>

					{/* Load more — only in list mode */}
					{displayMode === "list" && hasMore && !loading && artworks.length > 0 && (
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

					{!loading && artworks.length === 0 && displayMode !== "list" && (
						<div className="flex flex-col items-center justify-center py-24 gap-4">
							<p className="text-stone-400 dark:text-stone-600 text-sm">No artworks found</p>
							<button
								onClick={clearFilters}
								className="text-xs text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 underline underline-offset-2 transition-colors"
							>
								Browse all artworks
							</button>
						</div>
					)}
				</div>
			</section>
		</div>
	);
}
