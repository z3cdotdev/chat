'use client';

import { RiBarChartLine, RiVipCrownLine } from "@remixicon/react";
import { useSWRApi } from '@/hooks/use-swr-api';
import { useTranslations } from "next-intl";

export default function UsagePage() {
	const t = useTranslations("SettingsUsagePage");

	const { data, isLoading } = useSWRApi("/usages");

	if (isLoading) return (
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

	return (
		<div className="w-full max-w-2xl h-full mx-auto flex flex-col space-y-10">
			<div className="w-full flex flex-col border-l lg:border-none lg:grid grid-cols-3">
				<div className="lg:border-r flex flex-col pl-4 lg:pl-0 lg:items-end pr-5 pb-3 lg:pb-5 py-5 lg:text-right">
					<h1 className="text-lg text-foreground font-medium">{t("MembershipType")}</h1>
					<p className="text-muted text-sm">{t("MembershipTypeDescription")}</p>
				</div>
				<div className="col-span-2 pt-0 lg:pt-5 py-5 lg:pl-5 pl-2 space-y-3">
					<div className="bg-gradient-to-br from-orange-800/20 border border-orange-400/30 to-orange-800/20 via-transparent w-full overflow-hidden rounded-2xl relative">
						<div className="w-full p-4 rounded-2xl bg-orange-600/10">
							<div className="text-orange-600/20 absolute top-3 right-3">
								<RiVipCrownLine size={96} />
							</div>
							<h3 className="text-orange-900/40">{t("Membership")}</h3>
							<h1 className="text-orange-400 text-3xl font-bold">{t("Normal")}</h1>
						</div>
					</div>
				</div>
			</div>
			<div className="w-full flex flex-col border-l lg:border-none lg:grid grid-cols-3">
				<div className="lg:border-r flex flex-col pl-4 lg:pl-0 lg:items-end pr-5 pb-3 lg:pb-5 py-5 lg:text-right">
					<h1 className="text-lg text-foreground font-medium">{t("Enhancement")}</h1>
					<p className="text-muted text-sm">{t("EnhancementDescription")}</p>
				</div>
				<div className="col-span-2 pt-0 lg:pt-5 py-5 lg:pl-5 pl-2 space-y-3">
					<div className="bg-gradient-to-br from-muted/20 to-muted/20 via-border w-full overflow-hidden p-px rounded-2xl relative">
						<div className="w-full p-4 rounded-2xl bg-secondary">
							<div className="text-muted/20 absolute top-3 right-3">
								<RiBarChartLine size={96} />
							</div>
							<h3 className="text-muted">{t("EnhancementLimit")}</h3>
							<h1 className="text-foreground text-3xl font-bold">{data?.data?.promptEnhancement?.limit || 0}</h1>
						</div>
					</div>
					<div className="bg-gradient-to-br from-muted/20 to-muted/20 via-border w-full overflow-hidden p-px rounded-2xl relative">
						<div className="w-full p-4 rounded-2xl bg-secondary">
							<div className="text-muted/20 absolute top-3 right-3">
								<RiBarChartLine size={96} />
							</div>
							<h3 className="text-muted">{t("Remaining")}</h3>
							<h1 className="text-foreground text-3xl font-bold">{data?.data?.promptEnhancement?.remaining || 0}</h1>
						</div>
					</div>
					<p className="text-muted text-sm">{t("Reset", { date: new Date(data?.data?.promptEnhancement?.reset).toDateString() })}</p>
				</div>
			</div>
			<div className="w-full flex flex-col border-l lg:border-none lg:grid grid-cols-3">
				<div className="lg:border-r flex flex-col pl-4 lg:pl-0 lg:items-end pr-5 pb-3 lg:pb-5 py-5 lg:text-right">
					<h1 className="text-lg text-foreground font-medium">{t("Model")}</h1>
					<p className="text-muted text-sm">{t("ModelDescription")}</p>
				</div>
				<div className="col-span-2 pt-0 lg:pt-5 py-5 lg:pl-5 pl-2 space-y-3">
					<div className="bg-gradient-to-br from-muted/20 to-muted/20 via-border w-full overflow-hidden p-px rounded-2xl relative">
						<div className="w-full p-4 rounded-2xl bg-secondary">
							<div className="text-muted/20 absolute top-3 right-3">
								<RiBarChartLine size={96} />
							</div>
							<h3 className="text-muted">{t("ModelLimit")}</h3>
							<h1 className="text-foreground text-3xl font-bold">{data?.data?.models?.limit || 0}</h1>
						</div>
					</div>
					<div className="bg-gradient-to-br from-muted/20 to-muted/20 via-border w-full overflow-hidden p-px rounded-2xl relative">
						<div className="w-full p-4 rounded-2xl bg-secondary">
							<div className="text-muted/20 absolute top-3 right-3">
								<RiBarChartLine size={96} />
							</div>
							<h3 className="text-muted">{t("Remaining")}</h3>
							<h1 className="text-foreground text-3xl font-bold">{data?.data?.models?.remaining || 0}</h1>
						</div>
					</div>
					<p className="text-muted text-sm">{t("Reset", { date: new Date(data?.data?.models?.reset).toDateString() })}</p>
				</div>
			</div>
		</div>
	);
};