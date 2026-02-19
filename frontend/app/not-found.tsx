"use client";
import { Dices } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

export default function NotFound() {
	const themes = [
		{
			name: "gray",
			text: "text-gray-900",
			subtext: "text-gray-600",
			primaryBg: "bg-gray-900",
			primaryText: "text-white",
			secondaryBtn: "text-gray-900 bg-gray-200 border border-gray-900 hover:text-gray-800 hover:bg-gray-100",
			svg: "text-gray-300",
		},
		{
			name: "slate",
			text: "text-slate-900",
			subtext: "text-slate-600",
			primaryBg: "bg-slate-900",
			primaryText: "text-white",
			secondaryBtn: "text-slate-900 bg-slate-200 border border-slate-900 hover:text-slate-800 hover:bg-slate-100",
			svg: "text-slate-300",
		},
		{
			name: "stone",
			text: "text-stone-900",
			subtext: "text-stone-600",
			primaryBg: "bg-stone-900",
			primaryText: "text-white",
			secondaryBtn: "text-stone-900 bg-stone-200 border border-stone-900 hover:text-stone-800 hover:bg-stone-100",
			svg: "text-stone-300",
		},
		{
			name: "zinc",
			text: "text-zinc-900",
			subtext: "text-zinc-600",
			primaryBg: "bg-zinc-900",
			primaryText: "text-white",
			secondaryBtn: "text-zinc-900 bg-zinc-200 border border-zinc-900 hover:text-zinc-800 hover:bg-zinc-100",
			svg: "text-zinc-300",
		},
		{
			name: "neutral",
			text: "text-neutral-900",
			subtext: "text-neutral-600",
			primaryBg: "bg-neutral-900",
			primaryText: "text-white",
			secondaryBtn:
				"text-neutral-900 bg-neutral-200 border border-neutral-900 hover:text-neutral-800 hover:bg-neutral-100",
			svg: "text-neutral-300",
		},
		{
			name: "red",
			text: "text-red-900",
			subtext: "text-red-600",
			primaryBg: "bg-red-900",
			primaryText: "text-white",
			secondaryBtn: "text-red-900 bg-red-200 border border-red-900 hover:text-red-800 hover:bg-red-100",
			svg: "text-red-300",
		},
		{
			name: "rose",
			text: "text-rose-900",
			subtext: "text-rose-600",
			primaryBg: "bg-rose-900",
			primaryText: "text-white",
			secondaryBtn: "text-rose-900 bg-rose-200 border border-rose-900 hover:text-rose-800 hover:bg-rose-100",
			svg: "text-rose-300",
		},
		{
			name: "pink",
			text: "text-pink-900",
			subtext: "text-pink-600",
			primaryBg: "bg-pink-900",
			primaryText: "text-white",
			secondaryBtn: "text-pink-900 bg-pink-200 border border-pink-900 hover:text-pink-800 hover:bg-pink-100",
			svg: "text-pink-300",
		},
		{
			name: "fuchsia",
			text: "text-fuchsia-900",
			subtext: "text-fuchsia-600",
			primaryBg: "bg-fuchsia-900",
			primaryText: "text-white",
			secondaryBtn:
				"text-fuchsia-900 bg-fuchsia-200 border border-fuchsia-900 hover:text-fuchsia-800 hover:bg-fuchsia-100",
			svg: "text-fuchsia-300",
		},
		{
			name: "violet",
			text: "text-violet-900",
			subtext: "text-violet-600",
			primaryBg: "bg-violet-900",
			primaryText: "text-white",
			secondaryBtn:
				"text-violet-900 bg-violet-200 border border-violet-900 hover:text-violet-800 hover:bg-violet-100",
			svg: "text-violet-300",
		},
		{
			name: "indigo",
			text: "text-indigo-900",
			subtext: "text-indigo-600",
			primaryBg: "bg-indigo-900",
			primaryText: "text-white",
			secondaryBtn:
				"text-indigo-900 bg-indigo-200 border border-indigo-900 hover:text-indigo-800 hover:bg-indigo-100",
			svg: "text-indigo-300",
		},
		{
			name: "blue",
			text: "text-blue-900",
			subtext: "text-blue-600",
			primaryBg: "bg-blue-900",
			primaryText: "text-white",
			secondaryBtn: "text-blue-900 bg-blue-200 border border-blue-900 hover:text-blue-800 hover:bg-blue-100",
			svg: "text-blue-300",
		},
		{
			name: "sky",
			text: "text-sky-900",
			subtext: "text-sky-600",
			primaryBg: "bg-sky-900",
			primaryText: "text-white",
			secondaryBtn: "text-sky-900 bg-sky-200 border border-sky-900 hover:text-sky-800 hover:bg-sky-100",
			svg: "text-sky-300",
		},
		{
			name: "cyan",
			text: "text-cyan-900",
			subtext: "text-cyan-600",
			primaryBg: "bg-cyan-900",
			primaryText: "text-white",
			secondaryBtn: "text-cyan-900 bg-cyan-200 border border-cyan-900 hover:text-cyan-800 hover:bg-cyan-100",
			svg: "text-cyan-300",
		},
		{
			name: "teal",
			text: "text-teal-900",
			subtext: "text-teal-600",
			primaryBg: "bg-teal-900",
			primaryText: "text-white",
			secondaryBtn: "text-teal-900 bg-teal-200 border border-teal-900 hover:text-teal-800 hover:bg-teal-100",
			svg: "text-teal-300",
		},
		{
			name: "emerald",
			text: "text-emerald-900",
			subtext: "text-emerald-600",
			primaryBg: "bg-emerald-900",
			primaryText: "text-white",
			secondaryBtn:
				"text-emerald-900 bg-emerald-200 border border-emerald-900 hover:text-emerald-800 hover:bg-emerald-100",
			svg: "text-emerald-300",
		},
		{
			name: "lime",
			text: "text-lime-900",
			subtext: "text-lime-600",
			primaryBg: "bg-lime-900",
			primaryText: "text-white",
			secondaryBtn: "text-lime-900 bg-lime-200 border border-lime-900 hover:text-lime-800 hover:bg-lime-100",
			svg: "text-lime-300",
		},
		{
			name: "amber",
			text: "text-amber-900",
			subtext: "text-amber-600",
			primaryBg: "bg-amber-900",
			primaryText: "text-white",
			secondaryBtn: "text-amber-900 bg-amber-200 border border-amber-900 hover:text-amber-800 hover:bg-amber-100",
			svg: "text-amber-300",
		},
		{
			name: "yellow",
			text: "text-yellow-900",
			subtext: "text-yellow-600",
			primaryBg: "bg-yellow-900",
			primaryText: "text-white",
			secondaryBtn:
				"text-yellow-900 bg-yellow-200 border border-yellow-900 hover:text-yellow-800 hover:bg-yellow-100",
			svg: "text-yellow-300",
		},
		{
			name: "orange",
			text: "text-orange-900",
			subtext: "text-orange-600",
			primaryBg: "bg-orange-900",
			primaryText: "text-white",
			secondaryBtn:
				"text-orange-900 bg-orange-200 border border-orange-900 hover:text-orange-800 hover:bg-orange-100",
			svg: "text-orange-300",
		},
		{
			name: "amber-soft",
			text: "text-amber-800",
			subtext: "text-amber-500",
			primaryBg: "bg-amber-800",
			primaryText: "text-white",
			secondaryBtn: "text-amber-800 bg-amber-200 border border-amber-800 hover:text-amber-700 hover:bg-amber-100",
			svg: "text-amber-300",
		},
		{
			name: "emerald-soft",
			text: "text-emerald-800",
			subtext: "text-emerald-500",
			primaryBg: "bg-emerald-800",
			primaryText: "text-white",
			secondaryBtn:
				"text-emerald-800 bg-emerald-200 border border-emerald-800 hover:text-emerald-700 hover:bg-emerald-100",
			svg: "text-emerald-300",
		},
		{
			name: "teal-soft",
			text: "text-teal-800",
			subtext: "text-teal-500",
			primaryBg: "bg-teal-800",
			primaryText: "text-white",
			secondaryBtn: "text-teal-800 bg-teal-200 border border-teal-800 hover:text-teal-700 hover:bg-teal-100",
			svg: "text-teal-300",
		},
		{
			name: "pink-soft",
			text: "text-pink-800",
			subtext: "text-pink-500",
			primaryBg: "bg-pink-800",
			primaryText: "text-white",
			secondaryBtn: "text-pink-800 bg-pink-200 border border-pink-800 hover:text-pink-700 hover:bg-pink-100",
			svg: "text-pink-300",
		},
	];

	const [themeIndex, setThemeIndex] = useState(0);
	const theme = themes[themeIndex];

	function cycleTheme() {
		setThemeIndex((i) => (i + 1) % themes.length);
	}

	return (
		<>
			{/* Head/metadata handled by layout/metadata in App Router; omitted here */}
			<div className="fixed top-0 left-0 w-[100dvw] h-[100dvh] bg-gradient-to-br from-gray-50 to-gray-200">
				<div className="absolute inset-0 w-full h-full p-4 pt-8 overflow-hidden">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 1 94.69999694824219 35.0099983215332"
						data-asc="0.72021484375"
						width="100%"
						height="100%"
						preserveAspectRatio="none"
						className={`${theme.svg} fill-current transition-colors duration-300 opacity-70`}
					>
						<defs />
						<g>
							<g transform="translate(0, 0)">
								<path d="M0 23.95L17.26 1.00L23.14 1.00L23.14 23.95L27.86 23.95L27.86 28.76L23.14 28.76L23.14 36.01L18.14 36.01L18.14 28.76L0 28.76L0 23.95M18.14 23.95L18.14 7.06L5.44 23.95L18.14 23.95ZM61.35 31.01Q61.35 32.03 60.96 32.95Q60.57 33.86 59.89 34.55Q59.20 35.23 58.29 35.62Q57.37 36.01 56.35 36.01L38.84 36.01Q37.82 36.01 36.90 35.62Q35.99 35.23 35.30 34.55Q34.62 33.86 34.23 32.95Q33.84 32.03 33.84 31.01L33.84 6.01Q33.84 4.98 34.23 4.06Q34.62 3.15 35.30 2.48Q35.99 1.81 36.90 1.40Q37.82 1.00 38.84 1.00L56.35 1.00Q57.37 1.00 58.29 1.40Q59.20 1.81 59.89 2.48Q60.57 3.15 60.96 4.06Q61.35 4.98 61.35 6.01L61.35 31.01M38.84 6.01L38.84 31.01L56.35 31.01L56.35 6.01L38.84 6.01ZM66.85 23.95L84.11 1.00L89.99 1.00L89.99 23.95L94.70 23.95L94.70 28.76L89.99 28.76L89.99 36.01L84.99 36.01L84.99 28.76L66.85 28.76L66.85 23.95M84.99 23.95L84.99 7.06L72.29 23.95L84.99 23.95Z" />
							</g>
						</g>
					</svg>
				</div>

				<div className="absolute inset-0 flex flex-col items-center justify-center">
					<h1 className={`text-4xl font-bold transition-colors duration-300 ${theme.text}`}>
						{/* Large: visible on lg and up */}
						<span className="hidden lg:inline">Soms raken ook digitale ideeën even de weg kwijt.</span>
						{/* Medium: visible from md up, but hidden on lg and up */}
						<span className="hidden md:inline lg:hidden">Soms raken ideeën de weg kwijt.</span>
						{/* Small: visible below md */}
						<span className="inline md:hidden">We zijn je kwijt!</span>
					</h1>
					<p className={`mt-4 text-lg transition-colors duration-300 ${theme.subtext}`}>
						{/* Large paragraph */}
						<span className="hidden lg:inline">De opgegeven pagina kon niet worden gevonden.</span>
						{/* Medium paragraph */}
						<span className="hidden md:inline lg:hidden">De pagina niet gevonden</span>
						{/* Small paragraph */}
						<span className="inline md:hidden">Pagina niet gevonden</span>
					</p>
					<div className="flex mt-8 space-x-4">
						<Link
							href="/"
							className={`inline-block px-4 py-2 text-sm font-semibold rounded-md shadow transition-colors duration-300 ${theme.primaryText} ${theme.primaryBg}`}
						>
							{/* Large CTA */}
							<span className="hidden lg:inline">Ga terug naar de homepage!</span>
							{/* Medium CTA */}
							<span className="hidden md:inline lg:hidden">Ga terug naar de homepage!</span>
							{/* Small CTA */}
							<span className="inline md:hidden">Ga terug!</span>
						</Link>
						<button
							onClick={cycleTheme}
							className={`inline-block px-4 py-2 text-sm font-semibold rounded-md shadow transition-colors duration-300 ${theme.secondaryBtn}`}
							title={`Wissel van kleur (huidig: ${theme.name})`}
							aria-label={`Wissel van kleur, huidige kleur: ${theme.name}`}
						>
							<Dices />
						</button>
					</div>
				</div>
			</div>
		</>
	);
}
