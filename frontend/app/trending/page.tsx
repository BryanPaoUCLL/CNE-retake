"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, TrendingUp, Flame } from "lucide-react";
import { ArtworkSummaryDto } from "@/src/types";
import ArtworkService from "@/src/services/artwork.service";
import ArtworkGrid from "@/src/components/ArtworkGrid";

export default function TrendingPage() {
	const [artworks, setArtworks] = useState<ArtworkSummaryDto[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchTrending() {
			try {
				setLoading(true);
				const response = await ArtworkService.trending();
				if (response.ok) {
					const data = await response.json();
					setArtworks(data);
				}
			} catch (err) {
				console.error("Failed to fetch trending:", err);
			} finally {
				setLoading(false);
			}
		}

		fetchTrending();
	}, []);

	return (
		<div className="min-h-screen bg-white">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				{/* Back button */}
				<Link
					href="/"
					className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors"
				>
					<ArrowLeft size={18} />
					<span>Back</span>
				</Link>

				{/* Header */}
				<div className="mb-8">
					<div className="flex items-center gap-3 mb-2">
						<div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
							<Flame
								size={20}
								className="text-white"
							/>
						</div>
						<h1 className="text-3xl font-semibold text-gray-900">Trending</h1>
					</div>
					<p className="text-gray-500">Most viewed artworks right now</p>
				</div>

				{/* Stats bar */}
				{!loading && artworks.length > 0 && (
					<div className="flex items-center gap-6 mb-8 pb-6 border-b border-gray-100">
						<div className="flex items-center gap-2 text-sm text-gray-600">
							<TrendingUp
								size={16}
								className="text-orange-500"
							/>
							<span>
								<strong className="text-gray-900">{artworks.length}</strong> trending artworks
							</span>
						</div>
						<div className="text-sm text-gray-400">Updated hourly</div>
					</div>
				)}

				{/* Ranking list for top 3 */}
				{!loading && artworks.length > 0 && (
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
						{artworks.slice(0, 3).map((artwork, index) => (
							<Link
								key={artwork.id}
								href={`/artwork/${artwork.id}`}
								className="group relative"
							>
								<div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100">
									<img
										src={artwork.imageUrl}
										alt={artwork.title}
										className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
									/>
									{/* Rank badge */}
									<div
										className={`absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ${
											index === 0
												? "bg-gradient-to-br from-yellow-400 to-orange-500"
												: index === 1
													? "bg-gradient-to-br from-gray-300 to-gray-500"
													: "bg-gradient-to-br from-orange-600 to-amber-700"
										}`}
									>
										{index + 1}
									</div>
									{/* Overlay */}
									<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
								</div>
								<div className="mt-3">
									<h3 className="font-medium text-gray-900 group-hover:text-gray-600 transition-colors truncate">
										{artwork.title}
									</h3>
									<p className="text-sm text-gray-500">
										{artwork.views?.toLocaleString() || 0} views
									</p>
								</div>
							</Link>
						))}
					</div>
				)}

				{/* Rest of the grid */}
				{artworks.length > 3 && (
					<>
						<h2 className="text-lg font-medium text-gray-900 mb-6">More trending</h2>
						<ArtworkGrid
							artworks={artworks.slice(3)}
							loading={false}
						/>
					</>
				)}

				{/* Empty state */}
				{!loading && artworks.length === 0 && (
					<div className="text-center py-16">
						<div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
							<TrendingUp
								size={24}
								className="text-gray-400"
							/>
						</div>
						<p className="text-gray-500">No trending artworks yet</p>
					</div>
				)}

				{/* Loading state */}
				{loading && (
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
						{[...Array(3)].map((_, i) => (
							<div key={i}>
								<div className="aspect-[4/3] rounded-2xl bg-gray-100 animate-pulse" />
								<div className="mt-3 h-5 w-32 bg-gray-100 rounded animate-pulse" />
								<div className="mt-1 h-4 w-20 bg-gray-100 rounded animate-pulse" />
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
