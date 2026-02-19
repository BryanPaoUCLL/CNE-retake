"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Grid3X3, Image as ImageIcon } from "lucide-react";
import { AccountDto, ArtworkSummaryDto } from "@/src/types";
import AccountService from "@/src/services/account.service";
import ArtworkGrid from "@/src/components/ArtworkGrid";
import { useAuth } from "@/src/context/AuthContext";

export default function ProfilePage() {
	const params = useParams();
	const id = params.id as string;
	const { user } = useAuth();

	const [account, setAccount] = useState<AccountDto | null>(null);
	const [artworks, setArtworks] = useState<ArtworkSummaryDto[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const isOwn = user?.id === Number(id);

	useEffect(() => {
		async function fetchProfile() {
			try {
				setLoading(true);
				const [accountResponse, artworksResponse] = await Promise.all([
					AccountService.getById(Number(id)),
					AccountService.getArtworks(Number(id)),
				]);
				if (!accountResponse.ok || !artworksResponse.ok) {
					throw new Error("Failed to load profile");
				}
				const accountData = await accountResponse.json();
				const artworksData = await artworksResponse.json();
				setAccount(accountData);
				setArtworks(artworksData);
			} catch (err) {
				console.error("Failed to fetch profile:", err);
				setError("Profile not found");
			} finally {
				setLoading(false);
			}
		}

		if (id) {
			fetchProfile();
		}
	}, [id]);

	if (loading) {
		return (
			<div className="min-h-screen bg-white">
				<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
					{/* Header skeleton */}
					<div className="flex items-center gap-8 mb-12">
						<div className="w-32 h-32 rounded-full bg-gray-100 animate-pulse" />
						<div className="flex-1">
							<div className="h-8 w-48 bg-gray-100 rounded animate-pulse mb-3" />
							<div className="h-5 w-64 bg-gray-100 rounded animate-pulse mb-4" />
							<div className="flex gap-8">
								<div className="h-5 w-24 bg-gray-100 rounded animate-pulse" />
								<div className="h-5 w-24 bg-gray-100 rounded animate-pulse" />
							</div>
						</div>
					</div>
					{/* Grid skeleton */}
					<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
						{[...Array(8)].map((_, i) => (
							<div
								key={i}
								className="aspect-square bg-gray-100 rounded-xl animate-pulse"
							/>
						))}
					</div>
				</div>
			</div>
		);
	}

	if (error || !account) {
		return (
			<div className="min-h-screen bg-white flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl font-semibold text-gray-900 mb-2">Profile not found</h1>
					<p className="text-gray-500 mb-6">This profile doesn't exist or has been removed.</p>
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

	// Generate initials for avatar
	const initials = account.username
		.split(" ")
		.map((n: string) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);

	return (
		<div className="min-h-screen bg-white">
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				{/* Back button */}
				<Link
					href="/"
					className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors"
				>
					<ArrowLeft size={18} />
					<span>Back</span>
				</Link>

				{/* Profile header */}
				<div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 mb-12">
					{/* Avatar */}
					<div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-gray-800 to-gray-600 flex items-center justify-center text-white text-3xl sm:text-4xl font-medium flex-shrink-0">
						{initials}
					</div>

					{/* Info */}
					<div className="flex-1 text-center sm:text-left">
						<div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
							<h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">{account.username}</h1>
							{isOwn && (
								<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 self-center sm:self-auto">
									Your profile
								</span>
							)}
						</div>

						{account.email && <p className="text-gray-500 mb-4">{account.email}</p>}

						{/* Stats */}
						<div className="flex items-center justify-center sm:justify-start gap-6 text-sm">
							<div className="flex items-center gap-2 text-gray-600">
								<Grid3X3 size={16} />
								<span>
									<strong className="text-gray-900">{artworks.length}</strong> artworks
								</span>
							</div>
						</div>
					</div>

					{/* Edit button (if own profile) */}
					{isOwn && (
						<Link
							href="/settings"
							className="px-6 py-2 border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
						>
							Edit Profile
						</Link>
					)}
				</div>

				{/* Divider */}
				<div className="border-t border-gray-100 mb-8" />

				{/* Artworks section */}
				<div className="mb-6">
					<div className="flex items-center gap-2 text-gray-900 font-medium">
						<ImageIcon size={18} />
						<span>Artworks</span>
					</div>
				</div>

				{artworks.length === 0 ? (
					<div className="text-center py-16">
						<div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
							<ImageIcon
								size={24}
								className="text-gray-400"
							/>
						</div>
						<p className="text-gray-500 mb-2">No artworks yet</p>
						{isOwn && (
							<Link
								href="/upload"
								className="text-gray-900 font-medium hover:underline"
							>
								Upload your first artwork
							</Link>
						)}
					</div>
				) : (
					<ArtworkGrid
						artworks={artworks}
						loading={false}
					/>
				)}
			</div>
		</div>
	);
}
