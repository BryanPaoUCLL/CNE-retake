"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, Image as ImageIcon, DollarSign, FileText } from "lucide-react";
import ArtworkService from "@/src/services/artwork.service";
import { useAuth } from "@/src/context/AuthContext";

const MAX_FILES = 10;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export default function UploadPage() {
	const router = useRouter();
	const { user, loading: authLoading } = useAuth();

	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [price, setPrice] = useState("");
	const [files, setFiles] = useState<File[]>([]);
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Redirect if not logged in
	if (!authLoading && !user) {
		return (
			<div className="min-h-screen bg-white flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl font-semibold text-gray-900 mb-2">Sign in required</h1>
					<p className="text-gray-500 mb-6">You need to be signed in to upload artworks.</p>
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

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (!title.trim()) {
			setError("Title is required");
			return;
		}
		if (files.length === 0) {
			setError("Please select at least one image");
			return;
		}
		if (!price || parseFloat(price) < 0) {
			setError("Please enter a valid price");
			return;
		}

		try {
			setUploading(true);
			const createResponse = await ArtworkService.create({
				title: title.trim(),
				description: description.trim() || undefined,
				price: parseFloat(price),
			});
			if (!createResponse.ok) {
				const errorData = await createResponse.json();
				throw new Error(errorData.message || "Failed to create artwork");
			}

			const artwork = await createResponse.json();
			const uploadResponse = await ArtworkService.uploadImages(artwork.id, files);
			if (!uploadResponse.ok) {
				const errorData = await uploadResponse.json();
				throw new Error(errorData.message || "Artwork created but image upload failed");
			}

			router.push(`/artwork/${artwork.id}`);
		} catch (err: any) {
			setError(err.message || "Failed to upload artwork");
		} finally {
			setUploading(false);
		}
	};

	const handleFileSelection = (selected: FileList | null) => {
		if (!selected) return;
		const selectedFiles = Array.from(selected);
		const oversized = selectedFiles.find((file) => file.size > MAX_FILE_SIZE_BYTES);
		if (oversized) {
			setError(`File ${oversized.name} exceeds 5MB limit.`);
			return;
		}

		const next = [...files, ...selectedFiles].slice(0, MAX_FILES);
		setFiles(next);
		setError(null);
	};

	const removeFile = (name: string) => {
		setFiles((prev) => prev.filter((file) => file.name !== name));
	};

	const previews = useMemo(() => files.map((file) => ({ file, url: URL.createObjectURL(file) })), [files]);
	const isValid = title.trim() && price && parseFloat(price) >= 0 && files.length > 0;

	return (
		<div className="min-h-screen bg-white">
			<div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
					<h1 className="text-3xl font-semibold text-gray-900 mb-2">Upload Artwork</h1>
					<p className="text-gray-500">Share your art with the world</p>
				</div>

				<form
					onSubmit={handleSubmit}
					className="space-y-6"
				>
					{/* Images */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">Images *</label>
						<label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-10 cursor-pointer hover:border-gray-400 transition-colors">
							<ImageIcon
								size={36}
								className="text-gray-400 mb-3"
							/>
							<p className="text-sm text-gray-600 mb-1">Select up to {MAX_FILES} images</p>
							<p className="text-xs text-gray-400">Allowed: jpeg, jpg, png, webp</p>
							<input
								type="file"
								accept="image/jpeg,image/png,image/webp,image/jpg"
								multiple
								onChange={(e) => handleFileSelection(e.target.files)}
								className="hidden"
							/>
						</label>
					</div>

					{previews.length > 0 && (
						<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
							{previews.map(({ file, url }) => (
								<div
									key={file.name}
									className="relative rounded-xl overflow-hidden border border-gray-200 bg-white"
								>
									<img
										src={url}
										alt={file.name}
										className="w-full h-32 object-cover"
									/>
									<div className="p-2">
										<p className="text-xs text-gray-600 truncate">{file.name}</p>
										<button
											type="button"
											onClick={() => removeFile(file.name)}
											className="mt-1 text-xs text-red-500 hover:text-red-600"
										>
											Remove
										</button>
									</div>
								</div>
							))}
						</div>
					)}

					{/* Title */}
					<div>
						<label
							htmlFor="title"
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							Title *
						</label>
						<div className="relative">
							<FileText
								size={18}
								className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
							/>
							<input
								type="text"
								id="title"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder="My Amazing Artwork"
								maxLength={100}
								className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-all"
							/>
						</div>
					</div>

					{/* Description */}
					<div>
						<label
							htmlFor="description"
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							Description
						</label>
						<textarea
							id="description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Tell the story behind your artwork..."
							rows={4}
							maxLength={500}
							className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-all resize-none"
						/>
						<p className="mt-1 text-sm text-gray-400 text-right">{description.length}/500</p>
					</div>

					{/* Price */}
					<div>
						<label
							htmlFor="price"
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							Price (USD) *
						</label>
						<div className="relative">
							<DollarSign
								size={18}
								className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
							/>
							<input
								type="number"
								id="price"
								value={price}
								onChange={(e) => setPrice(e.target.value)}
								placeholder="0.00"
								min="0"
								step="0.01"
								className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-all"
							/>
						</div>
						<p className="mt-1 text-sm text-gray-400">Set to 0 for a free artwork</p>
					</div>

					{/* Error */}
					{error && (
						<div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
							{error}
						</div>
					)}

					{/* Submit */}
					<button
						type="submit"
						disabled={!isValid || uploading}
						className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
					>
						{uploading ? (
							<>
								<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
								Uploading...
							</>
						) : (
							<>
								<Upload size={18} />
								Upload Artwork
							</>
						)}
					</button>
				</form>
			</div>
		</div>
	);
}
