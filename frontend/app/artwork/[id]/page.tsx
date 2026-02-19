"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArtworkDto, LikeCountDto } from "../../../src/types";
import { useAuth } from "../../../src/context/AuthContext";
import ArtworkService from "../../../src/services/artwork.service";
import PurchaseService from "../../../src/services/purchase.service";
import { Heart, Eye, Share2, ArrowLeft, ShoppingCart, User, Calendar, Check } from "lucide-react";

export default function ArtworkPage() {
	const { id } = useParams();
	const router = useRouter();
	const { user } = useAuth();

	const [artwork, setArtwork] = useState<ArtworkDto | null>(null);
	const [likeCount, setLikeCount] = useState(0);
	const [liked, setLiked] = useState(false);
	const [loading, setLoading] = useState(true);
	const [purchasing, setPurchasing] = useState(false);
	const [purchased, setPurchased] = useState(false);

	useEffect(() => {
		const loadArtwork = async () => {
			if (!id) return;
			setLoading(true);
			try {
				const [artworkRes, likesRes] = await Promise.all([
					ArtworkService.getById(Number(id)),
					ArtworkService.getLikeCount(Number(id)),
				]);

				if (artworkRes.ok) {
					setArtwork(await artworkRes.json());
				}
				if (likesRes.ok) {
					const data: LikeCountDto = await likesRes.json();
					setLikeCount(data.count);
				}
			} catch (err) {
				console.error("Failed to load artwork", err);
			} finally {
				setLoading(false);
			}
		};
		loadArtwork();
	}, [id]);

	const handleLike = async () => {
		if (!user) return;
		try {
			if (liked) {
				await ArtworkService.unlike(Number(id));
				setLikeCount((c) => Math.max(0, c - 1));
			} else {
				await ArtworkService.like(Number(id));
				setLikeCount((c) => c + 1);
			}
			setLiked(!liked);
		} catch {
			// ignore
		}
	};

	const handlePurchase = async () => {
		if (!user || !artwork) return;
		setPurchasing(true);
		try {
			const res = await PurchaseService.purchase(artwork.id);
			if (res.ok) {
				setPurchased(true);
			}
		} catch {
			// ignore
		} finally {
			setPurchasing(false);
		}
	};

	const handleShare = () => {
		if (navigator.share) {
			navigator.share({
				title: artwork?.title,
				url: window.location.href,
			});
		} else {
			navigator.clipboard.writeText(window.location.href);
		}
	};

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "EUR",
		}).format(price);
	};

	const formatDate = (date: string) => {
		return new Date(date).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
			</div>
		);
	}

	if (!artwork) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center">
				<h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">Artwork not found</h1>
				<button
					onClick={() => router.push("/")}
					className="text-violet-500 hover:text-violet-600"
				>
					Go back home
				</button>
			</div>
		);
	}

	const isOwner = user?.id === artwork.creator?.id;

	return (
		<div className="min-h-screen bg-white dark:bg-zinc-950">
			{/* Back button */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
				<button
					onClick={() => router.back()}
					className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
				>
					<ArrowLeft size={20} />
					Back
				</button>
			</div>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
				<div className="grid lg:grid-cols-2 gap-12">
					{/* Image */}
					<div className="relative">
						<div className="aspect-square rounded-3xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shadow-2xl">
							<img
								src={artwork.imageUrl || "/placeholder.jpg"}
								alt={artwork.title}
								className="w-full h-full object-cover"
							/>
						</div>
					</div>

					{/* Details */}
					<div className="flex flex-col">
						{/* Artist */}
						<Link
							href={`/profile/${artwork.creator?.id}`}
							className="flex items-center gap-3 mb-6 group"
						>
							<div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500 flex items-center justify-center">
								<User
									className="text-white"
									size={20}
								/>
							</div>
							<div>
								<p className="text-sm text-zinc-500 dark:text-zinc-400">Created by</p>
								<p className="font-medium text-zinc-900 dark:text-white group-hover:text-violet-500 transition-colors">
									{artwork.creator?.username || "Unknown"}
								</p>
							</div>
						</Link>

						{/* Title */}
						<h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mb-4">
							{artwork.title}
						</h1>

						{/* Description */}
						{artwork.description && (
							<p className="text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
								{artwork.description}
							</p>
						)}

						{/* Stats */}
						<div className="flex items-center gap-6 mb-8 text-zinc-500 dark:text-zinc-400">
							<div className="flex items-center gap-2">
								<Eye size={18} />
								<span>{artwork.views} views</span>
							</div>
							<div className="flex items-center gap-2">
								<Heart
									size={18}
									className={liked ? "fill-red-500 text-red-500" : ""}
								/>
								<span>{likeCount} likes</span>
							</div>
							<div className="flex items-center gap-2">
								<Calendar size={18} />
								<span>{formatDate(artwork.createdAt)}</span>
							</div>
						</div>

						{/* Price */}
						<div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-6 mb-6">
							<p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Price</p>
							<p className="text-3xl font-bold text-zinc-900 dark:text-white">
								{formatPrice(artwork.price)}
							</p>
						</div>

						{/* Actions */}
						<div className="flex flex-wrap gap-3">
							{!isOwner && !purchased && (
								<button
									onClick={handlePurchase}
									disabled={purchasing || !user}
									className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
								>
									<ShoppingCart size={20} />
									{purchasing ? "Processing..." : "Purchase"}
								</button>
							)}

							{purchased && (
								<div className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-green-500 text-white rounded-xl font-medium">
									<Check size={20} />
									Purchased
								</div>
							)}

							<button
								onClick={handleLike}
								disabled={!user}
								className={`p-4 rounded-xl border transition-colors ${
									liked
										? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-500"
										: "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
								} disabled:opacity-50 disabled:cursor-not-allowed`}
							>
								<Heart
									size={20}
									className={liked ? "fill-current" : ""}
								/>
							</button>

							<button
								onClick={handleShare}
								className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
							>
								<Share2 size={20} />
							</button>
						</div>

						{!user && (
							<p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400 text-center">
								Sign in to purchase or like this artwork
							</p>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
