"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Upload, Image as ImageIcon, X, Check, GripVertical } from "lucide-react";
import ArtworkService from "@/src/services/artwork.service";
import { useAuth } from "@/src/context/AuthContext";

const MAX_FILES = 10;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const STEPS = ["Images", "Reorder", "Cover", "Title", "Description", "Price", "Publish"] as const;

export default function UploadPage() {
	const router = useRouter();
	const { user, loading: authLoading } = useAuth();

	const [step, setStep] = useState(0);
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [price, setPrice] = useState("");
	const [files, setFiles] = useState<File[]>([]);
	const [mainIndex, setMainIndex] = useState(0);
	const [uploading, setUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

	if (!authLoading && !user) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<h1 className="font-[var(--font-bricolage)] text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-2">
						Sign in required
					</h1>
					<p className="text-stone-500 dark:text-stone-400 text-sm mb-6">
						You need to be signed in to upload artworks.
					</p>
					<Link
						href="/"
						className="text-sm text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors duration-300"
					>
						<ArrowLeft
							size={14}
							strokeWidth={1.5}
							className="inline mr-1"
						/>
						Back to gallery
					</Link>
				</div>
			</div>
		);
	}

	const previews = useMemo(() => files.map((file) => ({ file, url: URL.createObjectURL(file) })), [files]);

	const handleFileSelection = (selected: FileList | null) => {
		if (!selected) return;
		const selectedFiles = Array.from(selected);
		const oversized = selectedFiles.find((f) => f.size > MAX_FILE_SIZE_BYTES);
		if (oversized) {
			setError(`File ${oversized.name} exceeds 5 MB`);
			return;
		}
		const next = [...files, ...selectedFiles].slice(0, MAX_FILES);
		setFiles(next);
		setError(null);
	};

	const removeFile = (idx: number) => {
		setFiles((prev) => prev.filter((_, i) => i !== idx));
		if (mainIndex === idx) setMainIndex(0);
		else if (mainIndex > idx) setMainIndex((m) => m - 1);
	};

	const handleDragStart = (idx: number) => setDraggedIdx(idx);
	const handleDrop = (targetIdx: number) => {
		if (draggedIdx === null || draggedIdx === targetIdx) {
			setDraggedIdx(null);
			return;
		}
		const next = [...files];
		const [moved] = next.splice(draggedIdx, 1);
		next.splice(targetIdx, 0, moved);
		if (mainIndex === draggedIdx) setMainIndex(targetIdx);
		else if (draggedIdx < mainIndex && targetIdx >= mainIndex) setMainIndex((m) => m - 1);
		else if (draggedIdx > mainIndex && targetIdx <= mainIndex) setMainIndex((m) => m + 1);
		setFiles(next);
		setDraggedIdx(null);
	};

	const canNext = () => {
		switch (step) {
			case 0:
				return files.length > 0;
			case 1:
				return files.length > 0;
			case 2:
				return files.length > 0;
			case 3:
				return title.trim().length > 0;
			case 4:
				return true;
			case 5:
				return price !== "" && parseFloat(price) >= 0;
			case 6:
				return true;
			default:
				return false;
		}
	};

	const handleSubmit = async () => {
		setError(null);
		try {
			setUploading(true);
			setUploadProgress("Creating artwork...");
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

			for (let i = 0; i < files.length; i++) {
				setUploadProgress(`Uploading image ${i + 1} of ${files.length}...`);
				const uploadResponse = await ArtworkService.uploadImages(artwork.id, [files[i]]);
				if (!uploadResponse.ok) {
					const errorData = await uploadResponse.json().catch(() => ({}));
					throw new Error(errorData.message || `Failed to upload image ${i + 1}`);
				}
			}

			// Set main image if not the first one
			if (mainIndex > 0) {
				const artworkRes = await ArtworkService.getById(artwork.id);
				if (artworkRes.ok) {
					const artworkData = await artworkRes.json();
					const sortedImages = [...(artworkData.images || [])].sort(
						(a: any, b: any) => a.sortOrder - b.sortOrder,
					);
					if (sortedImages[mainIndex]) {
						await ArtworkService.setMainImage(artwork.id, sortedImages[mainIndex].id);
					}
				}
			}

			router.push(`/artwork/${artwork.id}`);
		} catch (err: any) {
			setError(err.message || "Failed to upload artwork");
			setUploading(false);
			setUploadProgress(null);
		}
	};

	return (
		<div className="min-h-screen">
			<div className="max-w-2xl mx-auto px-6 lg:px-10 py-12">
				<Link
					href="/"
					className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 mb-10 transition-colors duration-300"
				>
					<ArrowLeft
						size={16}
						strokeWidth={1.5}
					/>
					Back
				</Link>

				{/* Header */}
				<div className="mb-12">
					<p className="tracking-editorial text-stone-400 dark:text-stone-600 mb-3">Upload</p>
					<h1 className="font-[var(--font-bricolage)] text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-100 leading-[1.1]">
						Share your artwork
					</h1>
				</div>

				{/* Step indicator */}
				<div className="flex items-center gap-1 mb-12">
					{STEPS.map((label, i) => (
						<div
							key={label}
							className="flex items-center gap-1 flex-1"
						>
							<button
								onClick={() => {
									if (i < step) setStep(i);
								}}
								className={`h-1 w-full rounded-full transition-all duration-500 ${
									i <= step ? "bg-stone-900 dark:bg-stone-100" : "bg-stone-200 dark:bg-stone-800"
								}`}
							/>
						</div>
					))}
				</div>

				{/* Step label */}
				<p className="text-xs text-stone-400 dark:text-stone-600 mb-2">
					Step {step + 1} of {STEPS.length}
				</p>
				<h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-8">{STEPS[step]}</h2>

				{/* Step content */}
				<div className="min-h-[300px]">
					{/* Step 0: Upload images */}
					{step === 0 && (
						<div>
							<label className="flex flex-col items-center justify-center rounded-lg border border-dashed border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900/50 px-4 py-16 cursor-pointer hover:border-stone-400 dark:hover:border-stone-600 transition-colors duration-300">
								<Upload
									size={28}
									strokeWidth={1}
									className="text-stone-400 dark:text-stone-600 mb-4"
								/>
								<p className="text-sm text-stone-600 dark:text-stone-400 mb-1">
									Select up to {MAX_FILES} images
								</p>
								<p className="text-xs text-stone-400 dark:text-stone-600">
									JPEG, PNG, WebP &middot; Max 5 MB each
								</p>
								<input
									type="file"
									accept="image/jpeg,image/png,image/webp,image/jpg"
									multiple
									onChange={(e) => handleFileSelection(e.target.files)}
									className="hidden"
								/>
							</label>
							{previews.length > 0 && (
								<div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-6">
									{previews.map(({ file, url }, i) => (
										<div
											key={file.name + i}
											className="relative rounded-md overflow-hidden bg-stone-100 dark:bg-stone-900 aspect-square group/thumb"
										>
											<img
												src={url}
												alt={file.name}
												className="w-full h-full object-cover"
											/>
											<button
												type="button"
												onClick={() => removeFile(i)}
												className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity"
											>
												<X size={12} />
											</button>
										</div>
									))}
								</div>
							)}
						</div>
					)}

					{/* Step 1: Reorder */}
					{step === 1 && (
						<div className="space-y-2">
							<p className="text-sm text-stone-500 dark:text-stone-400 mb-6">
								Drag to reorder your images. The order determines how they appear in the gallery.
							</p>
							{files.map((file, i) => (
								<div
									key={file.name + i}
									draggable
									onDragStart={() => handleDragStart(i)}
									onDragOver={(e) => e.preventDefault()}
									onDrop={() => handleDrop(i)}
									className={`flex items-center gap-3 p-3 rounded-md bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 ${
										draggedIdx === i ? "opacity-50" : ""
									}`}
								>
									<GripVertical
										size={16}
										strokeWidth={1.5}
										className="text-stone-400 cursor-grab flex-shrink-0"
									/>
									<div className="w-12 h-12 rounded overflow-hidden bg-stone-200 dark:bg-stone-800 flex-shrink-0">
										<img
											src={URL.createObjectURL(file)}
											alt=""
											className="w-full h-full object-cover"
										/>
									</div>
									<span className="text-sm text-stone-700 dark:text-stone-300 truncate flex-1">
										{file.name}
									</span>
									<span className="text-xs text-stone-400">{i + 1}</span>
								</div>
							))}
						</div>
					)}

					{/* Step 2: Choose cover */}
					{step === 2 && (
						<div>
							<p className="text-sm text-stone-500 dark:text-stone-400 mb-6">
								Choose the main image that represents your artwork.
							</p>
							<div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
								{previews.map(({ file, url }, i) => (
									<button
										key={file.name + i}
										type="button"
										onClick={() => setMainIndex(i)}
										className={`relative rounded-md overflow-hidden aspect-square transition-all duration-300 ${
											mainIndex === i
												? "ring-2 ring-stone-900 dark:ring-stone-100 ring-offset-2 ring-offset-stone-50 dark:ring-offset-stone-950"
												: "opacity-60 hover:opacity-100"
										}`}
									>
										<img
											src={url}
											alt={file.name}
											className="w-full h-full object-cover"
										/>
										{mainIndex === i && (
											<div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-stone-900 dark:bg-stone-100 flex items-center justify-center">
												<Check
													size={12}
													strokeWidth={2}
													className="text-white dark:text-stone-900"
												/>
											</div>
										)}
									</button>
								))}
							</div>
						</div>
					)}

					{/* Step 3: Title */}
					{step === 3 && (
						<div>
							<input
								type="text"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder="Name your artwork"
								maxLength={100}
								autoFocus
								className="w-full bg-transparent border-0 border-b border-stone-200 dark:border-stone-800 text-2xl font-[var(--font-bricolage)] font-semibold text-stone-900 dark:text-stone-100 placeholder-stone-300 dark:placeholder-stone-700 py-4 focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition-colors duration-300"
							/>
							<p className="mt-3 text-xs text-stone-400 dark:text-stone-600">{title.length}/100</p>
						</div>
					)}

					{/* Step 4: Description */}
					{step === 4 && (
						<div>
							<textarea
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder="Tell the story behind your artwork..."
								rows={6}
								maxLength={500}
								autoFocus
								className="w-full bg-transparent border border-stone-200 dark:border-stone-800 rounded-lg text-sm text-stone-900 dark:text-stone-100 placeholder-stone-300 dark:placeholder-stone-700 p-4 focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 transition-colors duration-300 resize-none"
							/>
							<p className="mt-2 text-xs text-stone-400 dark:text-stone-600 text-right">
								{description.length}/500
							</p>
						</div>
					)}

					{/* Step 5: Price */}
					{step === 5 && (
						<div>
							<div className="flex items-baseline gap-2 mb-2">
								<span className="text-2xl text-stone-400 dark:text-stone-600">&euro;</span>
								<input
									type="number"
									value={price}
									onChange={(e) => setPrice(e.target.value)}
									placeholder="0.00"
									min="0"
									step="0.01"
									autoFocus
									className="w-full bg-transparent border-0 border-b border-stone-200 dark:border-stone-800 text-3xl font-[var(--font-bricolage)] font-bold text-stone-900 dark:text-stone-100 placeholder-stone-300 dark:placeholder-stone-700 py-4 focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition-colors duration-300"
								/>
							</div>
							<p className="text-xs text-stone-400 dark:text-stone-600">Set to 0 for a free artwork</p>
						</div>
					)}

					{/* Step 6: Review & Publish */}
					{step === 6 && (
						<div>
							<div className="grid grid-cols-[120px_1fr] gap-6 items-start mb-10">
								<div className="rounded-md overflow-hidden bg-stone-100 dark:bg-stone-900 aspect-square">
									{previews[mainIndex] && (
										<img
											src={previews[mainIndex].url}
											alt="Cover"
											className="w-full h-full object-cover"
										/>
									)}
								</div>
								<div>
									<h3 className="font-[var(--font-bricolage)] text-xl font-semibold text-stone-900 dark:text-stone-100 mb-1">
										{title}
									</h3>
									{description && (
										<p className="text-sm text-stone-500 dark:text-stone-400 line-clamp-2 mb-3">
											{description}
										</p>
									)}
									<p className="text-lg font-semibold text-stone-900 dark:text-stone-100">
										&euro;{parseFloat(price || "0").toFixed(2)}
									</p>
									<p className="text-xs text-stone-400 dark:text-stone-600 mt-2">
										{files.length} image{files.length !== 1 ? "s" : ""}
									</p>
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Error */}
				{error && (
					<div className="mt-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm">
						{error}
					</div>
				)}

				{/* Navigation */}
				<div className="flex items-center justify-between mt-12 pt-8 border-t border-stone-200 dark:border-stone-800">
					<button
						onClick={() => {
							setError(null);
							setStep((s) => Math.max(0, s - 1));
						}}
						disabled={step === 0}
						className="text-sm text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-300"
					>
						Back
					</button>

					{step < STEPS.length - 1 ? (
						<button
							onClick={() => {
								setError(null);
								setStep((s) => s + 1);
							}}
							disabled={!canNext()}
							className="flex items-center gap-2 px-6 py-3 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-full text-sm font-medium hover:bg-stone-800 dark:hover:bg-stone-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-300"
						>
							Continue
							<ArrowRight
								size={14}
								strokeWidth={1.5}
							/>
						</button>
					) : (
						<button
							onClick={handleSubmit}
							disabled={uploading}
							className="flex items-center gap-2 px-8 py-3 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-full text-sm font-medium hover:bg-stone-800 dark:hover:bg-stone-200 disabled:opacity-60 transition-colors duration-300"
						>
							{uploading ? (
								<>
									<div className="w-4 h-4 border border-white/30 dark:border-stone-900/30 border-t-white dark:border-t-stone-900 rounded-full animate-spin" />
									{uploadProgress ?? "Publishing..."}
								</>
							) : (
								<>
									<Upload
										size={14}
										strokeWidth={1.5}
									/>
									Publish
								</>
							)}
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
