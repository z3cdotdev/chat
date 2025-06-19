'use client';

import { RiExternalLinkLine, RiCodeLine, RiGithubLine } from "@remixicon/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function CreditsPage() {
	const t = useTranslations("SettingsCreditsPage");

	return (
		<div className="px-5 lg:px-20 max-w-4xl mx-auto w-full space-y-5">
			<div className="w-full h-40 bg-secondary rounded-2xl relative">
				<div className="absolute inset-0 z-1 flex flex-col justify-center px-5 lg:px-10">
					<div>
						{"z3c.dev".split("").map((letter, letterIndex) => (
							<motion.span
								key={`0-${letterIndex}`}
								initial={{ y: 100, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								transition={{
									delay: letterIndex * 0.03,
									type: "spring",
									stiffness: 150,
									damping: 25,
								}}
								className="inline-block text-4xl lg:text-5xl font-black text-orange-400"
							>
								{letter}
							</motion.span>
						))}
					</div>
					<p className="text-muted max-w-xs pt-3">{t("Description")}</p>
				</div>
				<div className="absolute inset-0 left-20 opacity-50">
					<FloatingPaths position={1} />
					<FloatingPaths position={-1} />
				</div>
			</div>
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
				<Link target='_blank' href='https://github.com/z3cdotdev'>
					<motion.div
						className="bg-secondary rounded-2xl p-5"
						whileHover={{ scale: 0.95 }}
						transition={{ type: "spring", stiffness: 150, damping: 25 }}
					>
						<RiExternalLinkLine size={48} />
						<h1 className="text-2xl text-foreground pt-3">{t("GitHub")}</h1>
						<p className="text-muted">{t("GitHubDescription")}</p>
					</motion.div>
				</Link>
				<div className="bg-secondary row-span-2 rounded-2xl p-5 flex-col flex">
					<RiCodeLine size={48} />
					<h1 className="text-2xl text-foreground pt-3">{t("Developers")}</h1>
					<p className="text-muted">{t("DevelopersDescription")}</p>
					<div className="flex flex-1 flex-col justify-end space-y-5">
						{([
							['clqu', 'mail@clqu.dev', 'd032af8986ff07e7d50530e8ced8e1adbe70c5fd81ae3d383c0e71821dc9f8f0', { github: 'clqu', web: 'https://clqu.dev' }],
							['swoth', 'me@swoth.dev', 'de85755e2118d69a6004e9f4179dd125bed362528bcdeccef069edb1a9769d75', { github: 'swothh', web: 'https://swoth.dev' }]
						] as const).map((dev, i) => (
							<Link key={i} target='_blank' href={`https://github.com/${dev[3].github}`}>
								<div key={i} className="flex space-x-3">
									<img
										src={`https://gravatar.com/avatar/${dev[2]}?d=retro`}
										className="w-10 h-10 rounded-xl"
									/>
									<div className="space-y-1">
										<h1 className="text-foreground leading-none">{dev[0]}</h1>
										<p className="text-muted leading-none">{dev[1]}</p>
										<div className="flex flex-wrap gap-y-2 gap-x-3 pt-1">
											<div className="flex items-center space-x-1 text-muted">
												<RiGithubLine size={16} />
												<p className="leading-none">{dev[3].github}</p>
											</div>
											<Link target='_blank' href={dev[3].web}>
												<div className="flex items-center space-x-1 text-muted">
													<RiExternalLinkLine size={16} />
													<p className="leading-none">{dev[3].web.replace('https://', '')}</p>
												</div>
											</Link>
										</div>
									</div>
								</div>
							</Link>
						))}
					</div>
				</div>
				<Link target='_blank' href='https://x.com/z3cdotdev'>
					<motion.div
						className="bg-secondary rounded-2xl p-5"
						whileHover={{ scale: 0.95 }}
						transition={{ type: "spring", stiffness: 150, damping: 25 }}
					>
						<RiExternalLinkLine size={48} />
						<h1 className="text-2xl text-foreground pt-3">{t("X")}</h1>
						<p className="text-muted">{t("XDescription")}</p>
					</motion.div>
				</Link>
			</div>
		</div>
	);
};

function FloatingPaths({ position }: { position: number }) {
	const paths = Array.from({ length: 36 }, (_, i) => ({
		id: i,
		d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${380 - i * 5 * position
			} -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${152 - i * 5 * position
			} ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${684 - i * 5 * position
			} ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
		color: `rgba(15,23,42,${0.1 + i * 0.03})`,
		width: 0.5 + i * 0.03,
	}))

	return (
		<div className="absolute inset-0 pointer-events-none">
			<svg className="w-full h-full text-slate-950 dark:text-white" viewBox="0 0 696 316" fill="none">
				<title>Background Paths</title>
				{paths.map((path) => (
					<motion.path
						key={path.id}
						d={path.d}
						stroke="currentColor"
						strokeWidth={path.width}
						strokeOpacity={0.1 + path.id * 0.03}
						initial={{ pathLength: 0.3, opacity: 0.6 }}
						animate={{
							pathLength: 1,
							opacity: [0.3, 0.6, 0.3],
							pathOffset: [0, 1, 0],
						}}
						transition={{
							duration: 20 + Math.random() * 10,
							repeat: Number.POSITIVE_INFINITY,
							ease: "linear",
						}}
					/>
				))}
			</svg>
		</div>
	)
};