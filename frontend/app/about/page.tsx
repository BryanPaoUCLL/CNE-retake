"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Users, Shield, Heart, ArrowRight, Palette, Globe, Award } from "lucide-react";

export default function AboutPage() {
	const observerRef = useRef<IntersectionObserver | null>(null);

	useEffect(() => {
		observerRef.current = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add("animate-fade-in-up");
						entry.target.classList.remove("opacity-0", "translate-y-8");
					}
				});
			},
			{ threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
		);

		const elements = document.querySelectorAll(".scroll-animate");
		elements.forEach((el) => observerRef.current?.observe(el));

		return () => observerRef.current?.disconnect();
	}, []);

	return (
		<div className="min-h-screen">
			{/* Hero Section */}
			<section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-zinc-50 dark:bg-zinc-950">
				{/* Background Pattern */}
				<div className="absolute inset-0 opacity-30 dark:opacity-20">
					<div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-amber-200 to-rose-200 dark:from-amber-900/30 dark:to-rose-900/30 rounded-full blur-3xl" />
					<div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-violet-200 to-cyan-200 dark:from-violet-900/30 dark:to-cyan-900/30 rounded-full blur-3xl" />
				</div>

				<div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-32">
					<div className="animate-fade-in">
						<div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-full text-sm text-zinc-600 dark:text-zinc-400 mb-8 border border-zinc-200 dark:border-zinc-800">
							<Sparkles
								size={14}
								className="text-amber-500"
							/>
							<span>Redefining Digital Art Since 2024</span>
						</div>
					</div>

					<h1 className="font-[var(--font-bricolage)] text-5xl sm:text-6xl lg:text-7xl font-extrabold text-zinc-900 dark:text-white mb-6 animate-fade-in stagger-1">
						The Gallery of
						<br />
						<span className="bg-gradient-to-r from-amber-600 via-rose-600 to-violet-600 bg-clip-text text-transparent">
							Tomorrow
						</span>
					</h1>

					<p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-10 animate-fade-in stagger-2">
						Galerique is where extraordinary art meets passionate collectors. We&apos;re building the
						world&apos;s most prestigious digital art gallery, one masterpiece at a time.
					</p>

					<div className="flex flex-wrap items-center justify-center gap-4 animate-fade-in stagger-3">
						<Link
							href="/"
							className="inline-flex items-center gap-2 px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all duration-300 hover:shadow-xl hover:shadow-zinc-900/20 dark:hover:shadow-white/10"
						>
							Explore Gallery
							<ArrowRight size={18} />
						</Link>
						<Link
							href="/upload"
							className="inline-flex items-center gap-2 px-8 py-4 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-full font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-300 border border-zinc-200 dark:border-zinc-800"
						>
							<Palette size={18} />
							Submit Your Art
						</Link>
					</div>
				</div>
			</section>

			{/* Stats Section */}
			<section className="py-20 bg-white dark:bg-zinc-900 border-y border-zinc-200 dark:border-zinc-800">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-8">
						{[
							{ value: "10K+", label: "Artworks" },
							{ value: "2.5K+", label: "Artists" },
							{ value: "50K+", label: "Collectors" },
							{ value: "€2M+", label: "Artist Earnings" },
						].map((stat, i) => (
							<div
								key={i}
								className="scroll-animate opacity-0 translate-y-8 text-center"
								style={{ transitionDelay: `${i * 100}ms` }}
							>
								<div className="font-[var(--font-bricolage)] text-4xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white mb-2">
									{stat.value}
								</div>
								<div className="text-zinc-500 dark:text-zinc-400 text-sm uppercase tracking-wider">
									{stat.label}
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Mission Section */}
			<section className="py-24 sm:py-32">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid lg:grid-cols-2 gap-16 items-center">
						<div className="scroll-animate opacity-0 translate-y-8">
							<h2 className="font-[var(--font-bricolage)] text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white mb-6">
								Our Mission
							</h2>
							<p className="text-lg text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
								Art has always been a mirror of human creativity and emotion. In the digital age, we
								believe extraordinary art deserves an equally extraordinary platform.
							</p>
							<p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
								Galerique was founded with a singular vision: to create a space where digital art is
								celebrated, artists are fairly compensated, and collectors can discover works that move
								their souls.
							</p>
							<div className="flex items-center gap-4">
								<div className="relative w-12 h-12">
									<Image
										src="/logo/brandmark.png"
										alt="Galerique"
										fill
										className="object-contain"
									/>
								</div>
								<div>
									<div className="font-medium text-zinc-900 dark:text-white">Founded in Belgium</div>
									<div className="text-sm text-zinc-500 dark:text-zinc-400">
										A UCLL Cloud Native Project
									</div>
								</div>
							</div>
						</div>
						<div className="scroll-animate opacity-0 translate-y-8 relative aspect-[4/3] rounded-3xl overflow-hidden bg-gradient-to-br from-amber-100 via-rose-100 to-violet-100 dark:from-amber-900/20 dark:via-rose-900/20 dark:to-violet-900/20">
							<div className="absolute inset-0 flex items-center justify-center">
								<div className="relative w-32 h-32">
									<Image
										src="/logo/brandmark.png"
										alt="Galerique Logo"
										fill
										className="object-contain"
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Values Section */}
			<section className="py-24 sm:py-32 bg-zinc-50 dark:bg-zinc-950">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16 scroll-animate opacity-0 translate-y-8">
						<h2 className="font-[var(--font-bricolage)] text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white mb-4">
							Our Values
						</h2>
						<p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
							The principles that guide everything we do at Galerique.
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
						{[
							{
								icon: (
									<Heart
										className="text-rose-500"
										size={28}
									/>
								),
								title: "Artist First",
								description:
									"We put artists at the center of everything. Fair compensation, creative freedom, and global exposure.",
							},
							{
								icon: (
									<Shield
										className="text-emerald-500"
										size={28}
									/>
								),
								title: "Trust & Safety",
								description:
									"Every artwork is verified. Every transaction is secure. Every collector is protected.",
							},
							{
								icon: (
									<Globe
										className="text-blue-500"
										size={28}
									/>
								),
								title: "Global Community",
								description:
									"Connecting artists and collectors from every corner of the world in one shared space.",
							},
							{
								icon: (
									<Award
										className="text-amber-500"
										size={28}
									/>
								),
								title: "Quality Curated",
								description:
									"We celebrate excellence. Our trending algorithm surfaces the most exceptional works.",
							},
						].map((value, i) => (
							<div
								key={i}
								className="scroll-animate opacity-0 translate-y-8 p-8 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-zinc-900/50"
								style={{ transitionDelay: `${i * 100}ms` }}
							>
								<div className="w-14 h-14 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-6">
									{value.icon}
								</div>
								<h3 className="font-semibold text-lg text-zinc-900 dark:text-white mb-3">
									{value.title}
								</h3>
								<p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
									{value.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* For Artists Section */}
			<section
				id="artists"
				className="py-24 sm:py-32"
			>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid lg:grid-cols-2 gap-16 items-center">
						<div className="order-2 lg:order-1 scroll-animate opacity-0 translate-y-8 relative aspect-[4/3] rounded-3xl overflow-hidden bg-gradient-to-br from-violet-100 via-fuchsia-100 to-pink-100 dark:from-violet-900/20 dark:via-fuchsia-900/20 dark:to-pink-900/20">
							<div className="absolute inset-0 flex items-center justify-center">
								<Palette className="w-24 h-24 text-violet-300 dark:text-violet-700" />
							</div>
						</div>
						<div className="order-1 lg:order-2 scroll-animate opacity-0 translate-y-8">
							<div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-100 dark:bg-violet-900/30 rounded-full text-sm text-violet-700 dark:text-violet-300 mb-6">
								<Palette size={14} />
								<span>For Artists</span>
							</div>
							<h2 className="font-[var(--font-bricolage)] text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white mb-6">
								Your Art Deserves a Stage
							</h2>
							<ul className="space-y-4 mb-8">
								{[
									"Upload unlimited artworks with no listing fees",
									"Set your own prices and receive instant payments",
									"Build your audience with powerful profile tools",
									"Get discovered through our intelligent trending system",
								].map((item, i) => (
									<li
										key={i}
										className="flex items-start gap-3 text-zinc-600 dark:text-zinc-400"
									>
										<div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
											<svg
												className="w-3 h-3 text-emerald-600 dark:text-emerald-400"
												fill="currentColor"
												viewBox="0 0 20 20"
											>
												<path
													fillRule="evenodd"
													d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
													clipRule="evenodd"
												/>
											</svg>
										</div>
										{item}
									</li>
								))}
							</ul>
							<Link
								href="/upload"
								className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all duration-300"
							>
								Start Uploading
								<ArrowRight size={16} />
							</Link>
						</div>
					</div>
				</div>
			</section>

			{/* Guidelines Section */}
			<section
				id="guidelines"
				className="py-24 sm:py-32 bg-zinc-50 dark:bg-zinc-950"
			>
				<div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-12 scroll-animate opacity-0 translate-y-8">
						<h2 className="font-[var(--font-bricolage)] text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white mb-4">
							Community Guidelines
						</h2>
						<p className="text-zinc-600 dark:text-zinc-400">
							A few simple rules to keep Galerique exceptional for everyone.
						</p>
					</div>

					<div className="space-y-6 scroll-animate opacity-0 translate-y-8">
						{[
							{
								title: "Original Work Only",
								description:
									"All artwork must be your own original creation. No AI-generated content, stolen work, or unauthorized derivatives.",
							},
							{
								title: "Respect Copyright",
								description:
									"Do not upload content that infringes on the intellectual property rights of others.",
							},
							{
								title: "Keep it Appropriate",
								description:
									"While we celebrate artistic expression, explicit pornographic content is not permitted.",
							},
							{
								title: "Be Authentic",
								description:
									"Use real information in your profile. Impersonation of other artists is strictly prohibited.",
							},
							{
								title: "Support Fellow Artists",
								description:
									"Engage constructively with the community. Harassment or discriminatory behavior will result in account termination.",
							},
						].map((rule, i) => (
							<div
								key={i}
								className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800"
							>
								<h3 className="font-semibold text-zinc-900 dark:text-white mb-2">{rule.title}</h3>
								<p className="text-zinc-500 dark:text-zinc-400 text-sm">{rule.description}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-24 sm:py-32">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center scroll-animate opacity-0 translate-y-8">
					<h2 className="font-[var(--font-bricolage)] text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white mb-6">
						Ready to Begin?
					</h2>
					<p className="text-lg text-zinc-600 dark:text-zinc-400 mb-10 max-w-2xl mx-auto">
						Whether you&apos;re an artist looking to share your vision or a collector seeking your next
						masterpiece, Galerique awaits.
					</p>
					<div className="flex flex-wrap items-center justify-center gap-4">
						<Link
							href="/"
							className="inline-flex items-center gap-2 px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all duration-300 hover:shadow-xl"
						>
							Explore the Gallery
							<ArrowRight size={18} />
						</Link>
					</div>
				</div>
			</section>
		</div>
	);
}
