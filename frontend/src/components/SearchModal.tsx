"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { ArtworkSummaryDto } from "../types";
import ArtworkService from "../services/artwork.service";

interface SearchModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<ArtworkSummaryDto[]>([]);
	const [trending, setTrending] = useState<ArtworkSummaryDto[]>([]);
	const [loading, setLoading] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const router = useRouter();

	// Fetch trending on mount
	useEffect(() => {
		if (isOpen) {
			ArtworkService.trending()
				.then((res) => res.json())
				.then((data) => setTrending(data.slice(0, 5)))
				.catch(() => {});
			inputRef.current?.focus();
		}
	}, [isOpen]);

	// Search with debounce
	const searchArtworks = useCallback(async (q: string) => {
		if (!q.trim()) {
			setResults([]);
			return;
		}
		setLoading(true);
		try {
			const res = await ArtworkService.search(q);
			const data = await res.json();
			setResults(data.slice(0, 8));
		} catch {
			setResults([]);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		const timer = setTimeout(() => {
			searchArtworks(query);
		}, 300);
		return () => clearTimeout(timer);
	}, [query, searchArtworks]);

	// Keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === "k") {
				e.preventDefault();
				if (isOpen) {
					onClose();
				}
			}
			if (e.key === "Escape" && isOpen) {
				onClose();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, onClose]);

	const navigateToArtwork = (id: number) => {
		router.push(`/artwork/${id}`);
		onClose();
		setQuery("");
	};

	if (!isOpen) return null;

	const displayResults = query.trim() ? results : trending;
	const showTrendingLabel = !query.trim() && trending.length > 0;

	return (
		<div className="fixed inset-0 z-[100] pt-20 px-4">
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/50 backdrop-blur-sm"
				onClick={onClose}
			/>

			{/* Modal */}
			<div className="relative max-w-2xl mx-auto bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden">
				{/* Search input */}
				<div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
					<Search
						size={20}
						className="text-zinc-400"
					/>
					<input
						ref={inputRef}
						type="text"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Search artworks, artists..."
						className="flex-1 bg-transparent text-lg text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none"
					/>
					{query && (
						<button
							onClick={() => setQuery("")}
							className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
						>
							<X size={18} />
						</button>
					)}
					<kbd className="hidden sm:block text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2 py-1 rounded">
						ESC
					</kbd>
				</div>

				{/* Results */}
				<div className="max-h-[400px] overflow-y-auto">
					{showTrendingLabel && (
						<div className="flex items-center gap-2 px-5 py-3 text-sm text-zinc-500 dark:text-zinc-400">
							<TrendingUp size={16} />
							Trending
						</div>
					)}

					{loading && <div className="px-5 py-8 text-center text-zinc-500">Searching...</div>}

					{!loading && displayResults.length === 0 && query.trim() && (
						<div className="px-5 py-8 text-center text-zinc-500">
							No artworks found for &quot;{query}&quot;
						</div>
					)}

					{!loading &&
						displayResults.map((artwork) => (
							<button
								key={artwork.id}
								onClick={() => navigateToArtwork(artwork.id)}
								className="w-full flex items-center gap-4 px-5 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-left"
							>
								<img
									src={artwork.imageUrl || "/placeholder.jpg"}
									alt={artwork.title}
									className="w-12 h-12 rounded-lg object-cover bg-zinc-100 dark:bg-zinc-800"
								/>
								<div className="flex-1 min-w-0">
									<p className="font-medium text-zinc-900 dark:text-white truncate">
										{artwork.title}
									</p>
									<p className="text-sm text-zinc-500 dark:text-zinc-400">
										{artwork.creator?.username || "Unknown"}
									</p>
								</div>
								<span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
									€{artwork.price.toFixed(2)}
								</span>
							</button>
						))}
				</div>

				{/* Footer */}
				<div className="px-5 py-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
					<span>Type to search</span>
					<span className="flex items-center gap-1">
						<kbd className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">↵</kbd>
						to select
					</span>
				</div>
			</div>
		</div>
	);
}
