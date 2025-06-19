'use client';

import { AnimatePresence, motion } from "framer-motion";
import { useFontStore } from "@/stores/use-font";
import { Select } from "@/components/ui/Select";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { cn } from "@colidy/ui-utils";
import { useTranslations } from "next-intl";

export default function CustomizationPage() {
	const t = useTranslations("SettingsCustomizationPage");

	const [viewMcMode, setViewMcMode] = useState(false);
	const [mcMode, setMcMode] = useState(false);

	const { theme, setTheme } = useTheme();
	const { codeFont, mainFont, setCodeFont, setMainFont } = useFontStore();

	useEffect(() => {
		if (theme !== 'pixel') return;
		setMainFont('lufga');

		setMcMode(true);
		setViewMcMode(true);
	}, [theme]);

	return (
		<div className="w-full max-w-2xl h-full mx-auto flex flex-col space-y-10">
			<div className="w-full flex flex-col border-l lg:border-none lg:grid grid-cols-3">
				<div className="lg:border-r flex flex-col pl-4 lg:pl-0 lg:items-end pr-5 pb-3 lg:pb-5 py-5 lg:text-right">
					<h1 className="text-lg text-foreground font-medium">{t("Theme")}</h1>
					<p className="text-muted text-sm">{t("ThemeDescription")}</p>
				</div>
				<div className="col-span-2 pt-0 lg:pt-5 py-5 lg:pl-5 pl-2 space-y-3">
					<div className="grid grid-cols-2 gap-3 w-full">
						{['dark', 'light'].map((t, i) => (
							<motion.a onClick={() => setTheme(t)} whileHover={{ scale: theme === t ? 1 : 0.95 }} key={i} className={cn("cursor-pointer from-muted/40 via-border to-muted/40 rounded-2xl p-px", { "bg-gradient-to-br": theme !== t, "bg-orange-400": theme === t })}>
								<div className="bg-secondary rounded-2xl p-2">
									<ThemePreview theme={t} />
								</div>
							</motion.a>
						))}
						{mcMode && (
							<motion.a
								onClick={() => setTheme("pixel")}
								whileHover={{ scale: theme === "pixel" ? 1 : 0.95 }}
								className={cn("cursor-pointer from-muted/40 via-border to-muted/40 rounded-2xl p-px", { "bg-gradient-to-br": theme !== "pixel", "bg-orange-400": theme === "pixel" })}
								initial={{ opacity: 0, scale: 0.75 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.75 }}
							>
								<div className="bg-secondary rounded-2xl p-2">
									<ThemePreview theme={"pixel"} />
								</div>
							</motion.a>
						)}
					</div>
				</div>
			</div>
			<div className="w-full flex flex-col border-l lg:border-none lg:grid grid-cols-3">
				<div className="lg:border-r flex flex-col pl-4 lg:pl-0 lg:items-end pr-5 pb-3 lg:pb-5 py-5 lg:text-right">
					<h1 className="text-lg text-foreground font-medium">{t("Font")}</h1>
					<p className="text-muted text-sm">{t("FontDescription")}</p>
				</div>
				<div className="col-span-2 py-5 pl-5 space-y-1.5">
					<p className="text-muted text-sm">{t("MainFont")}</p>
					<div className={"w-full transition-opacity " + (theme === 'pixel' ? 'opacity-50' : 'opacity-100')}>
						<Select
							placeholder={t("FontChoose")}
							value={mainFont || 'lufga'}
							onValueChange={v => setMainFont(v)}
							disabled={theme === 'pixel'}
						>
							{['Lufga', 'Inter', 'Roboto', 'Montserrat', 'Quicksand'].map((font, i) => (
								<Select.Item value={font.toLowerCase()} key={i}>
									<p style={{ fontFamily: `var(--font-${font === 'Lufga' ? 'main' : font.toLowerCase()})` }}>
										{font}
									</p>
								</Select.Item>
							))}
						</Select>
					</div>
					<p className="text-muted text-sm pt-3">{t("CodeFont")}</p>
					<Select
						placeholder={t("FontChoose")}
						value={(codeFont || 'jetbrains-mono').toLowerCase().replace(/ /g, '-')}
						onValueChange={v => setCodeFont(v.toLowerCase().replace(/ /g, '-'))}
					>
						{['JetBrains Mono', 'Geist Mono', 'Roboto Mono', 'Source Code Pro'].map((font, i) => (
							<Select.Item value={font.toLowerCase().replace(/ /g, '-')} key={i}>
								<p style={{ fontFamily: `var(--font-${font.toLowerCase().replace(/ /g, '-')})` }}>
									{font}
								</p>
							</Select.Item>
						))}
					</Select>
				</div>
			</div>
			<div className="w-full flex flex-col border-l lg:border-none lg:grid grid-cols-3">
				<div className="lg:border-r flex flex-col pl-4 lg:pl-0 lg:items-end pr-5 pb-3 lg:pb-5 py-5 lg:text-right">
					<h1 className="text-lg text-foreground font-medium">Minecraft?</h1>
					<p className="text-muted text-sm">Huh.</p>
				</div>
				<div className="col-span-2 pt-0 lg:pt-5 py-5 lg:pl-5 pl-2 space-y-3">
					<Select
						value={viewMcMode ? 'on' : 'off'}
						onValueChange={v => {
							if (v === 'off' && theme === 'pixel') setTheme('dark');
							setViewMcMode(v === 'on' ? true : false);
							if (v === 'off') setMcMode(false);
						}}
					>
						<Select.Item value="on">
							Açık
						</Select.Item>
						<Select.Item value="off">
							Kapalı
						</Select.Item>
					</Select>
				</div>
			</div>
			<AnimatePresence>
				{viewMcMode && (
					<motion.div
						className="w-full grid grid-cols-3"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 20 }}
					>
						<div className="border-r flex flex-col text-right items-end pr-5 py-5">
							<h1 className="text-lg text-foreground font-medium">{t("Minecraft")}</h1>
							<p className="text-muted text-sm">La-la-la-lava, ch-ch-ch-chicken.</p>
						</div>
						<div className="col-span-2 pt-0 lg:pt-5 py-5 lg:pl-5 pl-2 space-y-3">
							<Select
								value={mcMode ? 'on' : 'off'}
								onValueChange={v => {
									if (v === 'off' && theme === 'pixel') setTheme('dark');
									setMcMode(v === 'on' ? true : false);
								}}
							>
								<Select.Item value="on">
									{t("On")}
								</Select.Item>
								<Select.Item value="off">
									{t("Off")}
								</Select.Item>
							</Select>
							<AnimatePresence>
								{mcMode && (
									<motion.p initial={{ opacity: 0 }} exit={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-orange-400 text-sm">
										{t("SpecialTheme")}
									</motion.p>
								)}
							</AnimatePresence>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

function ThemePreview({ theme }: { theme: string }) {
	return (
		<div className={cn(theme, "w-full aspect-video overflow-hidden rounded-lg relative flex border", `bg-[hsl(var(--primary))]`)}>
			<span className={cn("absolute top-1 right-1 rounded-full h-2 w-4", `bg-[--foreground]`)} />
			<div className={cn("w-3 h-full shrink-0 border-r flex flex-col space-y-1 items-center py-1", `bg-[hsl(var(--primary))]`, `border-[hsl(var(--border))]`)}>
				{Array.from({ length: 4 }).map((_, i) => (
					<span key={i} className={cn("w-1 h-1 block rounded-full", `bg-[hsl(var(--muted))]`)} />
				))}
			</div>
			<div className="flex-1 flex flex-col items-center justify-center py-1">
				<div className="flex items-center justify-center flex-1">
					<div className={cn("border rounded-full p-2", `border-[hsl(var(--colored))]`)}>
						<div className={cn("border rounded-full p-2", `border-[hsl(var(--colored))]`)}>
							<span className={cn("w-2 h-2 rounded-full block", `bg-[hsl(var(--colored))]`)} />
						</div>
					</div>
				</div>
				<span className={cn("block shrink-0 w-16 h-5 border rounded-lg", `bg-[hsl(var(--secondary))]`, `border-[hsl(var(--border))]`)} />
			</div>
		</div>
	);
};