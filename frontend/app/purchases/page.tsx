"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, Package, Calendar, DollarSign } from "lucide-react";
import { PurchaseDto } from "@/src/types";
import PurchaseService from "@/src/services/purchase.service";
import { useAuth } from "@/src/context/AuthContext";

export default function PurchasesPage() {
	const { user, loading: authLoading } = useAuth();
	const [purchases, setPurchases] = useState<PurchaseDto[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchPurchases() {
			if (!user) return;
			try {
				setLoading(true);
				const response = await PurchaseService.myPurchases();
				if (response.ok) {
					const data = await response.json();
					setPurchases(data);
				}
			} catch (err) {
				console.error("Failed to fetch purchases:", err);
			} finally {
				setLoading(false);
			}
		}

		if (user) {
			fetchPurchases();
		} else if (!authLoading) {
			setLoading(false);
		}
	}, [user, authLoading]);

	// Redirect if not logged in
	if (!authLoading && !user) {
		return (
			<div className="min-h-screen bg-white flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl font-semibold text-gray-900 mb-2">Sign in required</h1>
					<p className="text-gray-500 mb-6">You need to be signed in to view your purchases.</p>
					<Link
						href="/"
						className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
					>
						<ArrowLeft size={18} />
						Back to gallery
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-white">
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
						<div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
							<ShoppingBag
								size={20}
								className="text-white"
							/>
						</div>
						<h1 className="text-3xl font-semibold text-gray-900">My Purchases</h1>
					</div>
					<p className="text-gray-500">Artworks you've collected</p>
				</div>

				{/* Stats */}
				{!loading && purchases.length > 0 && (
					<div className="flex items-center gap-6 mb-8 pb-6 border-b border-gray-100">
						<div className="flex items-center gap-2 text-sm text-gray-600">
							<Package
								size={16}
								className="text-purple-500"
							/>
							<span>
								<strong className="text-gray-900">{purchases.length}</strong> artworks owned
							</span>
						</div>
						<div className="flex items-center gap-2 text-sm text-gray-600">
							<DollarSign
								size={16}
								className="text-green-500"
							/>
							<span>
								<strong className="text-gray-900">
									${purchases.reduce((sum, p) => sum + (p.purchasePrice || 0), 0).toLocaleString()}
								</strong>{" "}
								total spent
							</span>
						</div>
					</div>
				)}

				{/* Loading state */}
				{loading && (
					<div className="space-y-4">
						{[...Array(4)].map((_, i) => (
							<div
								key={i}
								className="flex gap-4 p-4 border border-gray-100 rounded-2xl"
							>
								<div className="w-24 h-24 bg-gray-100 rounded-xl animate-pulse shrink-0" />
								<div className="flex-1">
									<div className="h-5 w-48 bg-gray-100 rounded animate-pulse mb-2" />
									<div className="h-4 w-32 bg-gray-100 rounded animate-pulse mb-3" />
									<div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
								</div>
							</div>
						))}
					</div>
				)}

				{/* Purchases list */}
				{!loading && purchases.length > 0 && (
					<div className="space-y-4">
						{purchases.map((purchase) => (
							<Link
								key={purchase.id}
								href={`/artwork/${purchase.artwork.id}`}
								className="flex gap-4 p-4 border border-gray-100 rounded-2xl hover:border-gray-200 hover:bg-gray-50/50 transition-all group"
							>
								{/* Thumbnail */}
								<div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 shrink-0">
									<img
										src={purchase.artwork.imageUrl}
										alt={purchase.artwork.title}
										className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
									/>
								</div>

								{/* Info */}
								<div className="flex-1 min-w-0">
									<h3 className="font-medium text-gray-900 group-hover:text-gray-600 transition-colors truncate">
										{purchase.artwork.title}
									</h3>
									<p className="text-sm text-gray-500 mt-1">by {purchase.artwork.creator.username}</p>
									<div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
										<span className="font-medium text-gray-900">
											${purchase.purchasePrice?.toLocaleString() || "0"}
										</span>
										{purchase.purchaseDate && (
											<span className="flex items-center gap-1">
												<Calendar size={14} />
												{new Date(purchase.purchaseDate).toLocaleDateString("en-US", {
													month: "short",
													day: "numeric",
													year: "numeric",
												})}
											</span>
										)}
									</div>
								</div>

								{/* Owned badge */}
								<div className="shrink-0 self-center">
									<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600">
										Owned
									</span>
								</div>
							</Link>
						))}
					</div>
				)}

				{/* Empty state */}
				{!loading && purchases.length === 0 && (
					<div className="text-center py-16">
						<div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
							<ShoppingBag
								size={24}
								className="text-gray-400"
							/>
						</div>
						<p className="text-gray-500 mb-4">You haven't purchased any artworks yet</p>
						<Link
							href="/"
							className="inline-flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
						>
							Explore artworks
						</Link>
					</div>
				)}
			</div>
		</div>
	);
}
