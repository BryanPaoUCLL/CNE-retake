"use client";

import React from "react";
import { ArtworkSummaryDto } from "../types";
import ArtworkCard from "./ArtworkCard";

interface ArtworkGridProps {
	artworks: ArtworkSummaryDto[];
	onLike?: (id: number) => void;
	loading?: boolean;
}

export default function ArtworkGrid({ artworks, onLike, loading }: ArtworkGridProps) {
	if (loading) {
		return (
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
				{[...Array(8)].map((_, i) => (
					<div
						key={i}
						className="animate-pulse"
					>
						<div className="aspect-[4/3] rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
						<div className="mt-3 flex items-center justify-between">
							<div className="flex items-center gap-2">
								<div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700" />
								<div className="w-20 h-4 rounded bg-zinc-200 dark:bg-zinc-700" />
							</div>
							<div className="w-16 h-4 rounded bg-zinc-200 dark:bg-zinc-700" />
						</div>
					</div>
				))}
			</div>
		);
	}

	if (!artworks.length) {
		return (
			<div className="flex flex-col items-center justify-center py-20 text-center">
				<div className="w-16 h-16 mb-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
					<span className="text-2xl">🎨</span>
				</div>
				<h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">No artworks found</h3>
				<p className="text-zinc-500 dark:text-zinc-400 max-w-md">
					Be the first to share your creative work with the community.
				</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
			{artworks.map((artwork) => (
				<ArtworkCard
					key={artwork.id}
					artwork={artwork}
					onLike={onLike}
				/>
			))}
		</div>
	);
}
