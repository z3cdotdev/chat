'use client';

import { motion } from "framer-motion";
import { useSWRApi } from "@/hooks/use-swr-api";
import { reduceAgents } from "@/lib/get-agents";
import { RiArrowDownSLine, RiGeminiFill, RiPushpinFill } from "@remixicon/react";
import Input from "@/components/ui/Input";
import { useMemo, useState } from "react";
import { cn } from "@colidy/ui-utils";
import { authClient } from "@/lib/authClient";
import { Accordion } from "radix-ui";
import ModelIcon from "@/components/ui/ModelIcon";
import { useTranslations } from "next-intl";

export default function ModelsPage() {
    const t = useTranslations("SettingsModelsPage");

	const { data: session, isPending } = authClient.useSession();
	const [pinnedModels, setPinnedModels] = useState<any[]>(session?.user.pinned_agents || []);
	const { data, isLoading } = useSWRApi('/models/all');
	const [disabled, setDisabled] = useState('');
	const [search, setSearch] = useState('');
	const [filter, setFilter] = useState<{
		premium: boolean;
		non_premium: boolean;
		pinned: boolean;
	}>({
		premium: false,
		non_premium: false,
		pinned: false
	});

	const filteredData = isLoading ? [] : reduceAgents((data?.data as any[] || [])
		.filter(m => !m ? true : m.name.toLowerCase().includes(search.toLowerCase()))
		.filter(m => filter.premium ? m.premium : true)
		.filter(m => filter.non_premium ? !m.premium : true)
		.filter(m => filter.pinned ? pinnedModels?.includes?.(m._id) : true)
	);

	const handlePin = async (model: any) => {
		if (disabled) return;
		setDisabled(model._id);

		const pinned = pinnedModels?.includes?.((model as any)._id);
		await authClient.updateUser({
			pinned_agents: pinned ? pinnedModels?.filter((m: any) => m !== (model as any)._id) : [...(pinnedModels || []), (model as any)._id]
		}).then(() => {
			setDisabled('');
		});

		if (pinned && pinnedModels) setPinnedModels(pinnedModels?.filter((m: any) => m !== (model as any)._id) as any);
		if (!pinned && pinnedModels) setPinnedModels([...(pinnedModels || []), (model as any)._id] as any);
		setDisabled('');
	};

	if (isLoading || isPending) return (
		<div className="flex h-[calc(100vh-10rem)] w-full">
			<div className="flex-1 w-full h-full flex items-center justify-center">
				<div className="w-8 h-8 border border-muted rounded-full">
					<div className="w-full h-full animate-spin relative flex justify-center">
						<span className="w-2 h-2 bg-muted block rounded-full -translate-y-1/2" />
					</div>
				</div>
			</div>
		</div>
	);


	const filterButtons = (isActive: boolean) => cn([
		"bg-secondary text-sm text-muted px-4 py-2 rounded-xl cursor-pointer transition-all duration-200 ease-in-out",
		isActive && "bg-colored/10 text-colored"
	]);


	return (
		<div className="w-full max-w-2xl h-full mx-auto flex flex-col space-y-10">
			<div className="space-y-3">
				<div className="space-y-1">
					<h1 className="text-xl text-foreground font-medium">{t("Title")}</h1>
					<p className="text-muted max-w-lg text-sm">{t("Description")}</p>
				</div>
				<Input placeholder={t("SearchPlaceholder")} value={search} onChange={e => setSearch(e.target.value)} />
			</div>
			<Accordion.Root
				type="single"
				collapsible
				className="w-full space-y-2"
			>
				<p className="text-sm text-muted">
					{t("TotalModels", { count: filteredData.map(cat => cat.models.length).reduce((a, b) => a + b, 0) })}
				</p>
				<div className="flex items-center gap-2">
					<button className={filterButtons(!filter.premium && !filter.non_premium && !filter.pinned)} onClick={() => setFilter({ premium: false, non_premium: false, pinned: false })}>
						{t("All")}
					</button>
					<button className={filterButtons(filter.premium)} onClick={() => setFilter({ premium: true, non_premium: false, pinned: false })}>
						{t("Premium")}
					</button>
					<button className={filterButtons(filter.non_premium)} onClick={() => setFilter({ premium: false, non_premium: true, pinned: false })}>
						{t("NonPremium")}
					</button>
					<button className={filterButtons(filter.pinned)} onClick={() => setFilter({ premium: false, non_premium: false, pinned: true })}>
						{t("Pinned")}
					</button>
				</div>
				{
					filteredData.reverse().map((cat, i) => {
						const totalPremiumModels = cat.models.filter(m => m.premium).length;
						const totalModels = cat.models.length;
						// @ts-ignore
						const totalPinnedModels = cat.models.filter(m => pinnedModels?.includes?.(m._id)).length;

						return (<Accordion.Item value={cat.provider} key={i}>
							<Accordion.Header>
								<Accordion.Trigger
									className={cn([
										"group text-muted text-sm flex items-center font-medium rounded-xl cursor-pointer h-20",
										"bg-secondary w-full hover:bg-accent px-4 transition-all mb-2"
									])}
								>
									<div className="text-left">
										<div className="flex items-center gap-2">
											<ModelIcon model={cat.provider} size={20} />
											<h1 className="text-lg font-medium">{cat.provider}</h1>
										</div>
										<p className="text-sm text-muted">
											{t("ProviderDesc", { totalModels, totalPremiumModels, totalPinnedModels })}
										</p>
									</div>
									<RiArrowDownSLine size={20} className="ml-auto" />
								</Accordion.Trigger>
							</Accordion.Header>
							<Accordion.Content className={cn("!m-0", [
								"overflow-hidden text-sm transition-all duration-200 ease-in-out",
								"data-[state=open]:animate-accordion-down",
								"data-[state=closed]:animate-accordion-up",
							])}>
								<div className="space-y-3 w-full">
									{cat.models.map((model, k) => {
										const pinned = pinnedModels?.includes?.((model as any)._id);
										return (
											<motion.div
												key={k}
												onClick={() => handlePin(model)}
												className={cn("w-full flex bg-secondary cursor-pointer relative p-6 rounded-2xl space-x-5 border-2", {
													"border-secondary": !pinned,
													"border-orange-400": pinned
												})}
												initial={{ opacity: 0, scale: 0.95 }}
												whileInView={{ opacity: 1, scale: 1 }}
											>
												<div className="shrink-0">
													{pinned && <div className="absolute top-2 right-2">
														<RiPushpinFill size={24} className="text-orange-400" />
													</div>}
													<RiGeminiFill size={48} className="text-border" />
												</div>
												<div className="space-y-1">
													<div className="flex items-center space-x-2">
														<h1 className="text-lg font-medium">{model.name}</h1>
														{model.premium && <p className="bg-orange-800/10 text-xs text-orange-400 py-0.5 px-1.5 rounded-md">{t("Premium")}</p>}
														{((model as any)?.api_key_required || false) && <p className="bg-rose-800/10 text-xs text-rose-400 py-0.5 px-1.5 rounded-md">{t("ApiKeyRequired")}</p>}
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
													<p className="text-muted text-sm line-clamp-2">{model.description}</p>
												</div>
											</motion.div>
										);
									})}
								</div>
							</Accordion.Content>
						</Accordion.Item>);
					})
				}
			</Accordion.Root >
		</div >
	);
};