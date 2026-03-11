"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArtworkDto, ArtworkImageDto, LikeCountDto } from "../../../src/types";
import { useAuth } from "../../../src/context/AuthContext";
import ArtworkService from "../../../src/services/artwork.service";
import PurchaseService from "../../../src/services/purchase.service";
import { Heart, Eye, Share2, ArrowLeft, ShoppingCart, Check, Star, Trash2, Upload, GripVertical } from "lucide-react";

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
			/* ignore */
		}
	};

	const handlePurchase = async () => {
		if (!user || !artwork) return;
		setPurchasing(true);
		try {
			const res = await PurchaseService.purchase(artwork.id);
			if (res.ok) setPurchased(true);
		} catch {
			/* ignore */
		} finally {
			setPurchasing(false);
		}
	};

	const handleShare = () => {
		if (navigator.share) {
			navigator.share({ title: artwork?.title, url: window.location.href });
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
		if (orderedImageIds.length !== images.length) return;
		setImageActionBusy(true);
		setError(null);
		try {
			const response = await ArtworkService.reorderImages(artworkId, { orderedImageIds });
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

	const formatPrice = (price: number) =>
		new Intl.NumberFormat("en-US", { style: "currency", currency: "EUR" }).format(price);

	const formatDate = (date: string) =>
		new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

	const creatorInitial = (artwork?.creator?.username || "?")[0].toUpperCase();

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="w-8 h-8 border border-stone-300 dark:border-stone-700 border-t-stone-900 dark:border-t-stone-100 rounded-full animate-spin" />
			</div>
		);
	}

	if (!artwork) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center gap-4">
				<h1 className="font-[var(--font-bricolage)] text-2xl font-semibold text-stone-900 dark:text-stone-100">
					Artwork not found
				</h1>
				<button
					onClick={() => router.push("/")}
					className="text-sm text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
				>
					Return to gallery
				</button>
			</div>
		);
	}

	return (
		<div className="min-h-screen">
			{/* Back nav */}
			<div className="max-w-[1400px] mx-auto px-6 lg:px-10 pt-6 pb-2">
				<button
					onClick={() => router.back()}
					className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors duration-300"
				>
					<ArrowLeft
						size={16}
						strokeWidth={1.5}
					/>
					Back
				</button>
			</div>

			<div className="max-w-[1400px] mx-auto px-6 lg:px-10 pb-24">
				<div className="grid lg:grid-cols-[1fr_400px] gap-12 lg:gap-20">
					{/* === Image section === */}
					<div>
						{/* Main image */}
						<div className="overflow-hidden rounded-lg bg-stone-100 dark:bg-stone-900">
							<img
								src={activeImage?.url || artwork.imageUrl || FALLBACK_IMAGE}
								alt={artwork.title}
								className="w-full h-auto object-cover"
							/>
						</div>

						{/* Thumbnails */}
						{images.length > 1 && (
							<div className="mt-4 flex gap-3 overflow-x-auto pb-2">
								{images.map((image) => (
									<button
										key={image.id}
										type="button"
										onClick={() => setActiveImageId(image.id)}
										className={`relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden transition-all duration-300 ${
											activeImage?.id === image.id
												? "ring-2 ring-stone-900 dark:ring-stone-100 ring-offset-2 ring-offset-stone-50 dark:ring-offset-stone-950"
												: "opacity-60 hover:opacity-100"
										}`}
									>
										<img
											src={image.thumbnailUrl || image.url || FALLBACK_IMAGE}
											alt={image.originalFileName}
											className="w-full h-full object-cover"
										/>
										{image.isMainImage && (
											<span className="absolute top-1 left-1 w-4 h-4 rounded-full bg-stone-900/70 dark:bg-stone-100/70 flex items-center justify-center">
												<Star
													size={8}
													className="text-white dark:text-stone-900"
												/>
											</span>
										)}
									</button>
								))}
							</div>
						)}

						{/* Owner image management */}
						{isOwner && (
							<div className="mt-8 border border-stone-200 dark:border-stone-800 rounded-lg p-5">
								<div className="flex items-center justify-between gap-4 mb-5">
									<p className="text-xs tracking-editorial text-stone-400 dark:text-stone-600">
										Manage Images
									</p>
									<label className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-medium cursor-pointer hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors duration-300">
										<Upload
											size={12}
											strokeWidth={1.5}
										/>
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

								<div className="space-y-1.5">
									{images.map((image, index) => (
										<div
											key={image.id}
											draggable={!imageActionBusy}
											onDragStart={() => handleDragStart(image.id)}
											onDragOver={(e) => e.preventDefault()}
											onDrop={() => handleDropOnImage(image.id)}
											className="flex items-center justify-between gap-2 text-sm bg-stone-50 dark:bg-stone-900 rounded-md px-3 py-2.5 group/row"
										>
											<div className="flex items-center gap-2 truncate">
												<span className="text-stone-400 group-hover/row:text-stone-600 dark:group-hover/row:text-stone-300 cursor-grab">
													<GripVertical
														size={14}
														strokeWidth={1.5}
													/>
												</span>
												<span className="text-xs font-medium text-stone-500 dark:text-stone-400 w-5">
													{index + 1}
												</span>
												<span className="text-stone-700 dark:text-stone-300 truncate text-xs">
													{image.originalFileName}
												</span>
											</div>
											<div className="flex items-center gap-0.5">
												<button
													onClick={() => handleSetMain(image.id)}
													disabled={imageActionBusy || image.isMainImage}
													className="p-1.5 rounded-md hover:bg-stone-200 dark:hover:bg-stone-700 disabled:opacity-30 transition-colors"
													title="Set as main"
												>
													<Star
														size={13}
														strokeWidth={1.5}
														className={
															image.isMainImage
																? "text-amber-500 fill-amber-500"
																: "text-stone-400"
														}
													/>
												</button>
												<button
													onClick={() => handleDeleteImage(image.id)}
													disabled={imageActionBusy}
													className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-stone-400 hover:text-red-500 disabled:opacity-30 transition-colors"
													title="Delete"
												>
													<Trash2
														size={13}
														strokeWidth={1.5}
													/>
												</button>
											</div>
										</div>
									))}
								</div>
								<p className="mt-3 text-[11px] text-stone-400 dark:text-stone-600">
									Drag to reorder. First image without a main tag becomes the cover.
								</p>
							</div>
						)}
					</div>

					{/* === Details section === */}
					<div className="lg:sticky lg:top-24 lg:self-start">
						{/* Creator */}
						<Link
							href={`/profile/${artwork.creator?.id}`}
							className="flex items-center gap-3 mb-8 group"
						>
							<div className="w-10 h-10 rounded-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center text-sm font-semibold text-stone-600 dark:text-stone-300">
								{creatorInitial}
							</div>
							<div>
								<p className="text-[11px] text-stone-400 dark:text-stone-600">Artist</p>
								<p className="text-sm font-medium text-stone-900 dark:text-stone-100 group-hover:text-stone-500 transition-colors duration-300">
									{artwork.creator?.username || "Unknown"}
								</p>
							</div>
						</Link>

						{/* Title */}
						<h1 className="font-[var(--font-bricolage)] text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-100 leading-[1.15] mb-4">
							{artwork.title}
						</h1>

						{/* Description */}
						{artwork.description && (
							<p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed mb-8">
								{artwork.description}
							</p>
						)}

						{/* Stats */}
						<div className="flex items-center gap-5 mb-8 text-xs text-stone-400 dark:text-stone-500">
							<div className="flex items-center gap-1.5">
								<Eye
									size={14}
									strokeWidth={1.5}
								/>
								<span>{artwork.views?.toLocaleString()}</span>
							</div>
							<div className="flex items-center gap-1.5">
								<Heart
									size={14}
									strokeWidth={1.5}
									className={liked ? "fill-red-500 text-red-500" : ""}
								/>
								<span>{likeCount}</span>
							</div>
							<span>{formatDate(artwork.createdAt)}</span>
						</div>

						{/* Divider */}
						<div className="border-t border-stone-200 dark:border-stone-800 mb-8" />

						{/* Price */}
						<div className="mb-8">
							<p className="text-[11px] tracking-editorial text-stone-400 dark:text-stone-600 mb-2">
								Price
							</p>
							<p className="font-[var(--font-bricolage)] text-3xl font-bold text-stone-900 dark:text-stone-100">
								{formatPrice(artwork.price)}
							</p>
						</div>

						{/* Actions */}
						<div className="flex gap-3">
							{!isOwner && !purchased && (
								<button
									onClick={handlePurchase}
									disabled={purchasing || !user}
									className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-full text-sm font-medium hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
								>
									<ShoppingCart
										size={16}
										strokeWidth={1.5}
									/>
									{purchasing ? "Processing..." : "Purchase"}
								</button>
							)}

							{purchased && (
								<div className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 text-white rounded-full text-sm font-medium">
									<Check
										size={16}
										strokeWidth={1.5}
									/>
									Purchased
								</div>
							)}

							<button
								onClick={handleLike}
								disabled={!user}
								title="Like artwork"
								className={`w-12 h-12 flex items-center justify-center rounded-full border transition-all duration-300 ${
									liked
										? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-500"
										: "border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 hover:border-stone-400 dark:hover:border-stone-600"
								} disabled:opacity-30 disabled:cursor-not-allowed`}
							>
								<Heart
									size={16}
									strokeWidth={1.5}
									className={liked ? "fill-current" : ""}
								/>
							</button>

							<button
								onClick={handleShare}
								title="Share artwork"
								className="w-12 h-12 flex items-center justify-center rounded-full border border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 hover:border-stone-400 dark:hover:border-stone-600 transition-all duration-300"
							>
								<Share2
									size={16}
									strokeWidth={1.5}
								/>
							</button>
						</div>

						{error && (
							<div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs">
								{error}
							</div>
						)}

						{!user && (
							<p className="mt-6 text-xs text-stone-400 dark:text-stone-600 text-center">
								Sign in to purchase or like this artwork
							</p>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
