"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArtworkDto, ArtworkImageDto, LikeCountDto } from "../../../src/types";
import { useAuth } from "../../../src/context/AuthContext";
import ArtworkService from "../../../src/services/artwork.service";
import PurchaseService from "../../../src/services/purchase.service";
import {
	Heart,
	Eye,
	Share2,
	ArrowLeft,
	ShoppingCart,
	User,
	Calendar,
	Check,
	Star,
	Trash2,
	Upload,
	GripVertical,
} from "lucide-react";

const FALLBACK_IMAGE = "/logo/brandmark_squared.png";

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
	const [activeImageId, setActiveImageId] = useState<number | null>(null);
	const [imageActionBusy, setImageActionBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [draggedImageId, setDraggedImageId] = useState<number | null>(null);

	const artworkId = Number(id);
	const isOwner = user?.id === artwork?.creator?.id;

	const images = useMemo(() => {
		if (!artwork?.images) return [];
		return [...artwork.images].sort((a, b) => a.sortOrder - b.sortOrder);
	}, [artwork?.images]);

	const activeImage = useMemo(() => {
		if (!images.length) return null;
		if (activeImageId) {
			const selected = images.find((image) => image.id === activeImageId);
			if (selected) return selected;
		}
		return images.find((image) => image.isMainImage) || images[0];
	}, [activeImageId, images]);

	const loadArtwork = async () => {
		if (!artworkId) return;
		setLoading(true);
		setError(null);
		try {
			const [artworkRes, likesRes] = await Promise.all([
				ArtworkService.getById(artworkId),
				ArtworkService.getLikeCount(artworkId),
			]);

			if (artworkRes.ok) {
				const data = await artworkRes.json();
				setArtwork(data);
				setActiveImageId(data.images?.find((image: ArtworkImageDto) => image.isMainImage)?.id ?? null);
			} else {
				setArtwork(null);
			}
			if (likesRes.ok) {
				const data: LikeCountDto = await likesRes.json();
				setLikeCount(data.count);
			}
		} catch {
			setError("Failed to load artwork");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadArtwork();
	}, [id]);

	const handleLike = async () => {
		if (!user) return;
		try {
			if (liked) {
				await ArtworkService.unlike(artworkId);
				setLikeCount((c) => Math.max(0, c - 1));
			} else {
				await ArtworkService.like(artworkId);
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

	const refreshArtwork = async () => {
		const res = await ArtworkService.getById(artworkId);
		if (res.ok) {
			const data = await res.json();
			setArtwork(data);
		}
	};

	const handleUploadImages = async (fileList: FileList | null) => {
		if (!fileList || fileList.length === 0) return;
		setImageActionBusy(true);
		setError(null);
		try {
			const files = Array.from(fileList);
			const response = await ArtworkService.uploadImages(artworkId, files);
			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.message || "Image upload failed");
			}
			await refreshArtwork();
		} catch (err: any) {
			setError(err.message || "Image upload failed");
		} finally {
			setImageActionBusy(false);
		}
	};

	const handleSetMain = async (imageId: number) => {
		setImageActionBusy(true);
		setError(null);
		try {
			const response = await ArtworkService.setMainImage(artworkId, imageId);
			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.message || "Failed to set main image");
			}
			await refreshArtwork();
			setActiveImageId(imageId);
		} catch (err: any) {
			setError(err.message || "Failed to set main image");
		} finally {
			setImageActionBusy(false);
		}
	};

	const handleReorderByIds = async (orderedImageIds: number[]) => {
		if (orderedImageIds.length !== images.length) {
			return;
		}

		setImageActionBusy(true);
		setError(null);
		try {
			const response = await ArtworkService.reorderImages(artworkId, {
				orderedImageIds,
			});
			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.message || "Failed to reorder images");
			}
			await refreshArtwork();
		} catch (err: any) {
			setError(err.message || "Failed to reorder images");
		} finally {
			setImageActionBusy(false);
		}
	};

	const handleDragStart = (imageId: number) => {
		if (imageActionBusy) return;
		setDraggedImageId(imageId);
	};

	const handleDropOnImage = (targetImageId: number) => {
		if (!draggedImageId || draggedImageId === targetImageId) {
			setDraggedImageId(null);
			return;
		}

		const currentIds = images.map((image) => image.id);
		const from = currentIds.indexOf(draggedImageId);
		const to = currentIds.indexOf(targetImageId);
		if (from < 0 || to < 0) {
			setDraggedImageId(null);
			return;
		}

		const next = [...currentIds];
		next.splice(from, 1);
		next.splice(to, 0, draggedImageId);
		setDraggedImageId(null);
		void handleReorderByIds(next);
	};

	const handleDeleteImage = async (imageId: number) => {
		setImageActionBusy(true);
		setError(null);
		try {
			const response = await ArtworkService.deleteImage(artworkId, imageId);
			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.message || "Failed to delete image");
			}
			await refreshArtwork();
		} catch (err: any) {
			setError(err.message || "Failed to delete image");
		} finally {
			setImageActionBusy(false);
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

	return (
		<div className="min-h-screen bg-white dark:bg-zinc-950">
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
					<div className="relative">
						<div className="aspect-square rounded-3xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shadow-2xl">
							<img
								src={activeImage?.url || artwork.imageUrl || FALLBACK_IMAGE}
								alt={artwork.title}
								className="w-full h-full object-cover"
							/>
						</div>

						{images.length > 0 && (
							<div className="mt-4 grid grid-cols-4 gap-3">
								{images.map((image) => (
									<button
										key={image.id}
										type="button"
										onClick={() => setActiveImageId(image.id)}
										className={`relative rounded-xl overflow-hidden border-2 ${
											activeImage?.id === image.id ? "border-violet-500" : "border-transparent"
										}`}
									>
										<img
											src={image.thumbnailUrl || image.url || FALLBACK_IMAGE}
											alt={image.originalFileName}
											className="w-full h-20 object-cover"
										/>
										{image.isMainImage && (
											<span className="absolute top-1 left-1 inline-flex items-center gap-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
												<Star size={10} /> Main
											</span>
										)}
									</button>
								))}
							</div>
						)}

						{isOwner && (
							<div className="mt-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4">
								<div className="flex items-center justify-between gap-4 mb-4">
									<p className="text-sm text-zinc-500 dark:text-zinc-400">Manage artwork images</p>
									<label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900 text-white text-sm cursor-pointer hover:bg-zinc-800 transition-colors">
										<Upload size={14} />
										Upload
										<input
											type="file"
											multiple
											accept="image/jpeg,image/png,image/webp,image/jpg"
											onChange={(e) => handleUploadImages(e.target.files)}
											className="hidden"
											disabled={imageActionBusy}
										/>
									</label>
								</div>

								<div className="space-y-2">
									{images.map((image, index) => (
										<div
											key={image.id}
											draggable={!imageActionBusy}
											onDragStart={() => handleDragStart(image.id)}
											onDragOver={(e) => e.preventDefault()}
											onDrop={() => handleDropOnImage(image.id)}
											className="flex items-center justify-between gap-2 text-sm bg-zinc-50 dark:bg-zinc-900 rounded-lg px-3 py-2"
										>
											<div className="truncate">
												<span className="font-medium text-zinc-800 dark:text-zinc-100">
													#{index + 1}
												</span>{" "}
												<span className="text-zinc-600 dark:text-zinc-400 truncate">
													{image.originalFileName}
												</span>
											</div>
											<div className="flex items-center gap-1">
												<span className="p-1.5 text-zinc-500">
													<GripVertical size={14} />
												</span>
												<button
													onClick={() => handleSetMain(image.id)}
													disabled={imageActionBusy || image.isMainImage}
													className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-40"
													title="Set as main"
												>
													<Star
														size={14}
														className={
															image.isMainImage ? "text-yellow-500 fill-yellow-500" : ""
														}
													/>
												</button>
												<button
													onClick={() => handleDeleteImage(image.id)}
													disabled={imageActionBusy}
													className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 disabled:opacity-40"
													title="Delete"
												>
													<Trash2 size={14} />
												</button>
											</div>
										</div>
									))}
								</div>
								<p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
									Drag rows by the grip icon to reorder images.
								</p>
							</div>
						)}
					</div>

					<div className="flex flex-col">
						<Link
							href={`/profile/${artwork.creator?.id}`}
							className="flex items-center gap-3 mb-6 group"
						>
							<div className="w-12 h-12 rounded-full bg-linear-to-br from-violet-400 to-fuchsia-500 flex items-center justify-center">
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

						<h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mb-4">
							{artwork.title}
						</h1>

						{artwork.description && (
							<p className="text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
								{artwork.description}
							</p>
						)}

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

						<div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-6 mb-6">
							<p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Price</p>
							<p className="text-3xl font-bold text-zinc-900 dark:text-white">
								{formatPrice(artwork.price)}
							</p>
						</div>

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
								title="Like artwork"
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
								title="Share artwork"
								className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
							>
								<Share2 size={20} />
							</button>
						</div>

						{error && (
							<div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
								{error}
							</div>
						)}

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
