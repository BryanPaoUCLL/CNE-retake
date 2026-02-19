"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArtworkSummaryDto } from "../types";
import { Heart, Eye } from "lucide-react";

interface ArtworkCardProps {
	artwork: ArtworkSummaryDto;
	onLike?: (id: number) => void;
}

export default function ArtworkCard({ artwork, onLike }: ArtworkCardProps) {
	const [isHovered, setIsHovered] = useState(false);
	const [imageLoaded, setImageLoaded] = useState(false);

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "EUR",
		}).format(price);
	};

	return (
		<div
			className="group relative"
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			<Link href={`/artwork/${artwork.id}`}>
				<div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
					{/* Skeleton loader */}
					{!imageLoaded && (
						<div className="absolute inset-0 bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800 animate-pulse" />
					)}

					{/* Image */}
					<img
						src={artwork.imageUrl || "/placeholder.jpg"}
						alt={artwork.title}
						className={`w-full h-full object-cover transition-transform duration-500 ${
							isHovered ? "scale-105" : "scale-100"
						} ${imageLoaded ? "opacity-100" : "opacity-0"}`}
						onLoad={() => setImageLoaded(true)}
					/>

					{/* Hover overlay */}
					<div
						className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
							isHovered ? "opacity-100" : "opacity-0"
						}`}
					/>

					{/* Hover content */}
					<div
						className={`absolute bottom-0 left-0 right-0 p-4 transition-all duration-300 ${
							isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
						}`}
					>
						<h3 className="text-white font-medium text-lg line-clamp-1">{artwork.title}</h3>
						<p className="text-white/80 text-sm">by {artwork.creator?.username || "Unknown"}</p>
					</div>

					{/* Like button */}
					<button
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							onLike?.(artwork.id);
						}}
						className={`absolute top-3 right-3 p-2 bg-white/90 dark:bg-zinc-800/90 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${
							isHovered ? "opacity-100" : "opacity-0"
						}`}
					>
						<Heart
							size={18}
							className="text-zinc-700 dark:text-zinc-300 hover:text-red-500 transition-colors"
						/>
					</button>
				</div>
			</Link>

			{/* Card footer */}
			<div className="mt-3 flex items-center justify-between">
				<div className="flex items-center gap-2 min-w-0">
					<div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500 flex-shrink-0" />
					<span className="text-sm text-zinc-600 dark:text-zinc-400 truncate">
						{artwork.creator?.username || "Unknown"}
					</span>
				</div>
				<div className="flex items-center gap-3">
					<span className="flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-500">
						<Eye size={14} />
						{artwork.views}
					</span>
					<span className="text-sm font-semibold text-zinc-900 dark:text-white">
						{formatPrice(artwork.price)}
					</span>
				</div>
			</div>
		</div>
	);
}
