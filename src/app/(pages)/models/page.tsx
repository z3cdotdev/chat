"use client";

import { cn } from "@colidy/ui-utils";
import { useSWRApi } from "@/hooks/use-swr-api";
import { useMemo, useState } from "react";
import { reduceAgents } from "@/lib/get-agents";
import ModelIcon from "@/components/ui/ModelIcon";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useTranslations } from "next-intl";

export default function Z3Cs() {
	const {
		data: {
			data
		} = {
			data: {
				mostLikedAllTimes: [],
				mostDownloadedAllTimes: [],
				mostUsedAllTimes: [],
				categories: [],
				totalZ3Cs: 0
			}
		},
		isLoading,
		mutate
	} = useSWRApi("/models/all", {}, {
		revalidateOnFocus: false,
		revalidateOnReconnect: false,
		refreshInterval: 30000
	});

    const t = useTranslations("ModelsPage");

	const [search, setSearch] = useState("");
	const [providers, setProviders] = useState<string[]>([]);
	const [premiumFilter, setPremiumFilter] = useState<string | null>(null);

	const filteredData = useMemo(() => {
		if (isLoading) return [];
		return data?.filter((model: any) => model.name.toLowerCase().includes(search.toLowerCase()));
	}, [data, search, isLoading]);

	return (
		<div className="flex flex-col w-full max-w-7xl mx-auto p-3 sm:p-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between my-6 sm:mt-0 sm:mb-8 gap-4">
				<div>
					<h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">
						{t("Title")}
					</h1>
					<p className="text-sm sm:text-base text-muted max-w-2xl">
						{t("Description", { count: data?.length })}
					</p>
				</div>
			</div>

			{/* Arama */}
			<div className="gap-2 bg-primary">
				<input
					className={cn(
						"w-full rounded-xl sm:rounded-2xl bg-input outline-none border p-3 sm:p-4 text-sm text-foreground resize-none mb-6",
						"focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-background",
						"transition-all duration-200 ease-in-out hover:border-border-hover focus:!bg-input"
					)}
					placeholder={t("SearchPlaceholder")}
					type="text"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>

				<div className="flex flex-wrap gap-2 mb-2">
					<Button onClick={() => setPremiumFilter(null)} className={cn("bg-secondary text-foreground", {
						"bg-colored/10 text-colored": premiumFilter === null
					})}>{t("All")}</Button>
					<Button onClick={() => setPremiumFilter('premium')} className={cn("bg-secondary text-foreground", {
						"bg-colored/10 text-colored": premiumFilter === 'premium'
					})}>{t("Premium")}</Button>
					<Button onClick={() => setPremiumFilter('non_premium')} className={cn("bg-secondary text-foreground", {
						"bg-colored/10 text-colored": premiumFilter === 'non_premium'
					})}>{t("NonPremium")}</Button>
				</div>
				<div className="flex flex-wrap gap-2">
					{reduceAgents(filteredData || []).map((cat) => (
						<Button
							key={cat.provider}
							onClick={() => setProviders(providers.includes(cat.provider) ? providers.filter(p => p !== cat.provider) : [...providers, cat.provider])}
							className={cn("bg-secondary text-foreground", {
								"bg-colored/10 text-colored": providers.includes(cat.provider)
							})}
						>
							{cat.provider} ({cat.models.filter(model => premiumFilter ? (premiumFilter === 'non_premium' ? !model.premium : model.premium) : true).length})
						</Button>
					))}
				</div>
			</div>

			{isLoading ? (
				<LoadingState />
			) : (
				<div className="flex flex-col gap-12 mt-8">
					{reduceAgents(filteredData || [])
						.filter(cat => providers.length === 0 ? true : providers.includes(cat.provider))
						.filter(cat => cat.models.filter(model => premiumFilter ? (premiumFilter === 'non_premium' ? !model.premium : model.premium) : true).length > 0)
						.reverse()
						.map((cat, i) => (
							<div key={i} className="flex flex-col gap-2">
								<h2 className="text-lg font-bold">{cat.provider} ({cat.models.filter(model => premiumFilter ? (premiumFilter === 'non_premium' ? !model.premium : model.premium) : true).length})</h2>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
									{cat
										.models
										.filter(model => premiumFilter ? (premiumFilter === 'non_premium' ? !model.premium : model.premium) : true)
										.map((model, k) => (
											<motion.div
												key={k}
												className={cn("w-full flex bg-secondary cursor-pointer relative p-6 rounded-2xl space-x-5 border-2")}
												initial={{ opacity: 0, scale: 0.95 }}
												whileInView={{ opacity: 1, scale: 1 }}
											>
												<div className="shrink-0">
													<ModelIcon model={cat.provider} size={48} className="text-border" />
												</div>
												<div className="space-y-1">
													<div className="flex items-center space-x-2">
														<h1 className="text-lg font-medium">{model.name}</h1>
														{model.premium && <p className="bg-orange-800/10 text-xs text-orange-400 py-0.5 px-1.5 rounded-md">{t("Premium")}</p>}
														{((model as any)?.api_key_required || false) && <p className="bg-rose-800/10 text-xs text-rose-400 py-0.5 px-1.5 rounded-md">{t("APIKeyRequired")}</p>}
														{(!model.enabled || !model.available) && <p className="bg-red-800/10 text-xs text-red-400 py-0.5 px-1.5 rounded-md">{t("Disabled")}</p>}
													</div>
													<div className="flex items-center gap-2">
														{model.features?.experimental && <p className="bg-blue-800/10 text-xs text-blue-400 py-0.5 px-1.5 rounded-md">{t("Experimental")}</p>}
														{model.features?.reasoning && <p className="bg-green-800/10 text-xs dark:text-emerald-400 text-emerald-800 py-0.5 px-1.5 rounded-md">{t("Reasoning")}</p>}
														{model.features?.vision && <p className="bg-blue-800/10 text-xs text-blue-400 py-0.5 px-1.5 rounded-md">{t("Vision")}</p>}
														{model.features?.pdfSupport && <p className="bg-purple-800/10 text-xs text-purple-400 py-0.5 px-1.5 rounded-md">{t("PDFSupport")}</p>}
														{model.features?.imageGeneration && <p className="bg-pink-800/10 text-xs text-pink-400 py-0.5 px-1.5 rounded-md">{t("ImageGeneration")}</p>}
														{model.features?.search && <p className="bg-pink-800/10 text-xs text-pink-400 py-0.5 px-1.5 rounded-md">{t("WebSearch")}</p>}
														{model.features?.fast && <p className="bg-yellow-800/10 text-xs text-yellow-800 dark:text-yellow-400 py-0.5 px-1.5 rounded-md">{t("Fast")}</p>}
													</div>
													<p className="text-muted text-sm line-clamp-2 max-w-full">{model.description}</p>
												</div>
											</motion.div>
										))}
								</div>
							</div>
						))}
				</div>
			)}
		</div>


	);
}

function LoadingState() {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
			{Array.from({ length: 10 }).map((_, index) => (
				<div key={index} className="bg-secondary rounded-2xl overflow-hidden h-40">
					<div className="w-full h-full bg-secondary/50 shimmer" />
					<div className="p-4 space-y-3">
						<div className="h-4 bg-secondary/50 shimmer rounded" />
						<div className="h-3 bg-secondary/50 shimmer rounded w-2/3" />
						<div className="flex gap-2 mt-4">
							<div className="h-8 bg-secondary/50 shimmer rounded flex-1" />
							<div className="h-8 bg-secondary/50 shimmer rounded flex-1" />
						</div>
					</div>
				</div>
			))}
		</div>
	);
}