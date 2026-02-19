"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AccountService from "../services/account.service";

interface AuthModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
	const [mode, setMode] = useState<"login" | "signup">("login");
	const [identifier, setIdentifier] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [username, setUsername] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [remember, setRemember] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const { login } = useAuth();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			if (mode === "signup") {
				const res = await AccountService.create({ username, email, password });
				if (!res.ok) {
					let message = "Failed to create account";
					try {
						const data = await res.json();
						message = data.message || message;
					} catch {
						// response may not have JSON body
					}
					throw new Error(message);
				}
			}

			// Use email as identifier for login after signup, or the identifier field for regular login
			const loginIdentifier = mode === "signup" ? email : identifier;
			const success = await login(loginIdentifier, password, remember);
			if (success) {
				onClose();
				setIdentifier("");
				setEmail("");
				setPassword("");
				setUsername("");
			} else {
				throw new Error("Invalid credentials");
			}
		} catch (err: any) {
			setError(err.message || "Something went wrong");
		} finally {
			setLoading(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center">
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/50 backdrop-blur-sm"
				onClick={onClose}
			/>

			{/* Modal */}
			<div className="relative w-full max-w-md mx-4 bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden">
				{/* Close button */}
				<button
					onClick={onClose}
					className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
				>
					<X size={20} />
				</button>

				{/* Content */}
				<div className="p-8 pt-12">
					{/* Header */}
					<div className="text-center mb-8">
						<div className="w-14 h-14 mx-auto mb-4 relative">
							<Image
								src="/logo/brandmark.png"
								alt="Galerique"
								fill
								className="object-contain"
							/>
						</div>
						<h2 className="font-[var(--font-bricolage)] text-2xl font-extrabold text-zinc-900 dark:text-white">
							{mode === "login" ? "Welcome back" : "Join Galerique"}
						</h2>
						<p className="mt-2 text-zinc-500 dark:text-zinc-400">
							{mode === "login"
								? "Sign in to continue your journey"
								: "Discover and collect extraordinary art"}
						</p>
					</div>

					{/* Error message */}
					{error && (
						<div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm text-center">
							{error}
						</div>
					)}

					{/* Form */}
					<form
						onSubmit={handleSubmit}
						className="space-y-4"
					>
						{mode === "signup" ? (
							<>
								<div>
									<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
										Username
									</label>
									<input
										type="text"
										value={username}
										onChange={(e) => setUsername(e.target.value)}
										placeholder="Choose a username"
										className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800 border-0 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
										required
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
										Email
									</label>
									<input
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										placeholder="you@example.com"
										className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800 border-0 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
										required
									/>
								</div>
							</>
						) : (
							<div>
								<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
									Email or Username
								</label>
								<input
									type="text"
									value={identifier}
									onChange={(e) => setIdentifier(e.target.value)}
									placeholder="Enter your email or username"
									className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800 border-0 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
									required
								/>
							</div>
						)}

						<div>
							<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
								Password
							</label>
							<div className="relative">
								<input
									type={showPassword ? "text" : "password"}
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder="••••••••"
									className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800 border-0 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white pr-12"
									required
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
								>
									{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
								</button>
							</div>
						</div>

						{mode === "login" && (
							<div className="flex items-center gap-2">
								<input
									type="checkbox"
									id="remember"
									checked={remember}
									onChange={(e) => setRemember(e.target.checked)}
									className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:focus:ring-white"
								/>
								<label
									htmlFor="remember"
									className="text-sm text-zinc-600 dark:text-zinc-400"
								>
									Remember me
								</label>
							</div>
						)}

						<button
							type="submit"
							disabled={loading}
							className="w-full py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{loading ? "Loading..." : mode === "login" ? "Sign in" : "Create account"}
						</button>
					</form>

					{/* Toggle mode */}
					<p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
						{mode === "login" ? (
							<>
								Don&apos;t have an account?{" "}
								<button
									onClick={() => {
										setMode("signup");
										setError("");
									}}
									className="text-zinc-900 dark:text-white hover:underline font-medium"
								>
									Sign up
								</button>
							</>
						) : (
							<>
								Already have an account?{" "}
								<button
									onClick={() => {
										setMode("login");
										setError("");
									}}
									className="text-zinc-900 dark:text-white hover:underline font-medium"
								>
									Sign in
								</button>
							</>
						)}
					</p>
				</div>
			</div>
		</div>
	);
}
