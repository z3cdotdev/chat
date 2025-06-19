"use client";

import { useContext, useMemo, useState } from "react";
import { useMessages } from "@/hooks/use-messages";
import { useEnhanceStore } from "@/stores/use-enhance";
import { useAgentActionsStore } from "@/stores/use-agent-actions";
import { useAgentSelectionStore } from "@/stores/use-agent-selection";
import { Z3Context } from "@/contexts/Z3Provider";
import { Dropdown } from "../ui/Dropdown";
import { cn } from "@colidy/ui-utils";
import { Add01Icon, ArrowLeft01Icon, ArrowRight01Icon, ArrowUp01Icon, Brain02Icon, CharacterPhoneticIcon, CrownIcon, FileAddIcon, Globe02Icon, IdentificationIcon, ImageAdd01Icon, SlidersHorizontalIcon, SparklesIcon, Tick01Icon, Tick02Icon } from "hugeicons-react";
import { useAgentFeatureStore } from "@/stores/use-feature-store";
import { Select } from "@/ui/Select";
import {
	Gemini,
	Anthropic,
	OpenAI,
	DeepSeek,
	Mistral,
	Qwen,
	Meta,
	Grok,
	Microsoft,
	Replicate
} from "@lobehub/icons";
import { reduceAgents } from "@/lib/get-agents";
import { Tooltip } from "@/ui/Tooltip";
import { Button } from "../ui/Button";
import { Switch } from "../ui/Switch";
import { usePromptStore } from "@/stores/use-prompt";
import { RiSparkling2Fill } from "@remixicon/react";
import { useZ3cSelectionStore } from "@/stores/use-z3cs-select";
import { Z3cModel } from "@/lib/definitions";
import { useAttachmentsStore } from "@/stores/use-attachments";
import { Popover } from "../ui/Popover";
import { AnimatePresence, motion } from "motion/react";
import { ScrollArea } from "radix-ui";
import { useTranslations } from "next-intl";

export function Toolbar({ handleSubmit, isResponding, isCreatingConversation, setIsResponding, uploadRef, shouldShowSpinner }: {
	handleSubmit: () => void;
	isResponding?: boolean;
	isCreatingConversation?: boolean;
	setIsResponding?: (value: boolean) => void;
	uploadRef: React.RefObject<HTMLInputElement | null>;
	shouldShowSpinner?: boolean;
}) {
	const [activeToolMenu, setActiveToolMenu] = useState<string | null>(null);
	const z3Context = useContext(Z3Context);
	const agents = z3Context?.agents || [];
	const changeAgent = useAgentActionsStore(s => s.changeAgent);
	const selectedAgent = useAgentSelectionStore(s => s.selectedAgent);
	const prompt = usePromptStore(state => state.prompt);
	const attachments = useAttachmentsStore(state => state.attachments);
	const setFeature = useAgentFeatureStore(state => state.setFeature);
	const features = useAgentFeatureStore(state => state.features);
	const isEnhancing = useEnhanceStore(state => state.isEnhancing);
	const enhancePrompt = useEnhanceStore(state => state.enhancePrompt);

	const selectedZ3C = useZ3cSelectionStore(state => state.selectedZ3C);
	const setSelectedZ3C = useZ3cSelectionStore(state => state.setSelectedZ3C);
	const z3cs = z3Context?.installedZ3Cs || [];

	const { messages: allMessages } = useMessages();
	const t = useTranslations("Toolbar");

	const isWaiting = useMemo(() => {
		if (!allMessages || allMessages.length === 0) return false;
		const lastMessage = allMessages[allMessages.length - 1] as any;
		return lastMessage?.role === 'assistant' && lastMessage?.is_waiting;
	}, [allMessages]);

	const toolsClassName = `flex w-full justify-between text-xs select-none ${isEnhancing ? "opacity-50" : ""}`;
	const actionButtonClasses = (className: string) => cn([
		"flex items-center justify-center gap-2 text-foreground cursor-pointer transition-all",
		"border w-9 h-9 rounded-xl bg-muted/20 hover:bg-muted/30 active:bg-muted/40"
	], className);

	const toolMenuVariants = {
		initial: { opacity: 0, x: 5 },
		animate: { opacity: 1, x: 0 },
		exit: { opacity: 0, x: -5 },
		transition: { duration: 0.1 }
	}

	const toolItem = cn([
		"flex items-center gap-2 cursor-pointer transition-all px-3 py-2",
		"w-full rounded-xl hover:bg-popover-hover text-sm"
	]);

	const isSettingsVisible = (
		selectedAgent?.features.reasoning || selectedAgent?.features.search
		|| selectedAgent?.features.vision || selectedAgent?.features.pdfSupport
		|| z3cs.length > 0
	);

	return (
		<div className={toolsClassName}>
			<div className="flex items-center gap-2">
				{isSettingsVisible && (
					<Popover
						onOpenChange={(e) => {
							if (!e) {
								setActiveToolMenu(null);
							}
						}}
					>
						<Popover.Trigger className={actionButtonClasses("")}>
							<SlidersHorizontalIcon className="w-4 h-4" />
						</Popover.Trigger>
						<Popover.Content side="top" align="start" className="p-2">
							<motion.div initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
								<AnimatePresence mode="wait">
									{!activeToolMenu && (
										<motion.div className="flex flex-col items-center gap-1" {...toolMenuVariants} key="menu">
											{selectedAgent && (selectedAgent.features.vision || selectedAgent.features.pdfSupport) && (
												<button className={toolItem} onClick={() => setActiveToolMenu("vision")} key="vision">
													<ImageAdd01Icon className="w-4 h-4" />
													{t("Upload")}
													<ArrowRight01Icon className="w-4 h-4 ml-auto" />
												</button>
											)}
											{z3cs.length > 0 && (
												<button className={toolItem} onClick={() => setActiveToolMenu("z3cs")} key="z3cs">
													<IdentificationIcon className="w-4 h-4" />
													{t("Z3Cs")}
													<ArrowRight01Icon className="w-4 h-4 ml-auto" />
												</button>
											)}
											{selectedAgent?.features.reasoning || selectedAgent?.features.search && (
												<button className={toolItem} onClick={() => setActiveToolMenu("features")} key="ozellikler">
													<SparklesIcon className="w-4 h-4" />
													{t("ModelFeatures")}
													<ArrowRight01Icon className="w-4 h-4 ml-auto" />
												</button>
											)}
										</motion.div>
									)}
									{activeToolMenu === "vision" && (selectedAgent?.features.vision || selectedAgent?.features.pdfSupport) && (
										<motion.div className="flex flex-col gap-2" {...toolMenuVariants} key="vision">
											<div className={cn(toolItem, "!bg-transparent !px-2")} onClick={() => setActiveToolMenu(null)} key="geri">
												<button className={cn(toolItem, "w-5 h-5 !p-0 justify-center")}>
													<ArrowLeft01Icon className="w-4 h-4" />
												</button>
												<p>{t("Upload")}</p>
											</div>
											<hr className="w-full bg-border border-border" key="hr-icerik" />
											{selectedAgent?.features.vision && (
												<button
													className={toolItem}
													onClick={() => {
														uploadRef.current?.setAttribute("accept", "image/*");
														uploadRef.current?.click();
													}}
													key="resim-yukle"
												>
													<ImageAdd01Icon className="w-4 h-4" />
													<span>
														{t("ImageUpload")}
													</span>
												</button>
											)}
											{selectedAgent?.features.pdfSupport && (
												<button
													className={toolItem}
													onClick={() => {
														uploadRef.current?.setAttribute("accept", ".pdf,.txt,.doc,.docx");
														uploadRef.current?.click();
													}}
													key="dosya-yukle"
												>
													<FileAddIcon className="w-4 h-4" />
													<span>
														{t("FileUpload")}
													</span>
												</button>
											)}
										</motion.div>
									)}
									{activeToolMenu === "z3cs" && z3cs.length > 0 && (
										<motion.div className="flex flex-col gap-2" {...toolMenuVariants} key="z3cs">
											<div className={cn(toolItem, "!bg-transparent !px-2")} onClick={() => setActiveToolMenu(null)} key="geri">
												<button className={cn(toolItem, "w-5 h-5 !p-0 justify-center")}>
													<ArrowLeft01Icon className="w-4 h-4" />
												</button>
												<p>{t("Z3Cs")}</p>
											</div>
											<hr className="w-full bg-border border-border" key="hr-z3cs" />
											<div className="flex flex-col gap-1 overflow-y-auto max-h-[300px]" key="z3cs-listesi">
												<button className={toolItem} onClick={() => setSelectedZ3C(null)} key="devredisi-birak">
													<span className="text-sm">
														{t("Detach")}
													</span>
													{!selectedZ3C && (
														<Tick02Icon className="w-4 h-4 ml-auto" />
													)}
												</button>
												{z3cs.map((z3c, index) => (
													<button key={index} className={toolItem} onClick={() => setSelectedZ3C(z3c)}>
														{z3c.profile_image && (
															<img src={z3c.profile_image} alt={z3c.name} className="w-4 h-4 rounded-full" />
														)}
														<span className="text-sm">
															{z3c.name}
														</span>
														{selectedZ3C?._id === z3c._id && (
															<Tick02Icon className="w-4 h-4 ml-auto" />
														)}
													</button>
												))}
											</div>
										</motion.div>
									)}
									{activeToolMenu === "features" && (selectedAgent?.features.reasoning || selectedAgent?.features.search) && (
										<motion.div className="flex flex-col gap-2" {...toolMenuVariants} key="z3cs">
											<div className={cn(toolItem, "!bg-transparent !px-2")} onClick={() => setActiveToolMenu(null)} key="geri">
												<button className={cn(toolItem, "w-5 h-5 !p-0 justify-center")}>
													<ArrowLeft01Icon className="w-4 h-4" />
												</button>
												<p>{t("ModelFeatures")}</p>
											</div>
											<hr className="w-full bg-border border-border" key="hr-ozellikler" />
											<div className="flex flex-col gap-1 overflow-y-auto max-h-[300px]" key="ozellikler-listesi">
												{selectedAgent?.features.reasoning && (
													<div className={toolItem} onClick={() => setFeature('reasoning', !features.reasoning)} key="reasoning">
														<Brain02Icon className="w-4 h-4" />
														<span className="flex-1 text-left">
															{t("Reasoning")}
														</span>
														<Switch checked={features.reasoning} />
													</div>
												)}
												{selectedAgent?.features.search && (
													<div className={toolItem} onClick={() => setFeature('search', !features.search)} key="web-search">
														<Globe02Icon className="w-4 h-4" />
														<span className="flex-1 text-left">
															{t("WebSearch")}
														</span>
														<Switch checked={features.search} />
													</div>
												)}
											</div>
										</motion.div>
									)}
								</AnimatePresence>
							</motion.div>
						</Popover.Content>
					</Popover>
				)}
				<Select
					placeholder={t("SelectModel")}
					value={selectedAgent?.id || ''}
					onValueChange={(change: string) => changeAgent(change, z3Context as any)}
					triggerProps={{
						className: actionButtonClasses("w-auto md:px-4 justify-start overflow-hidden max-w-24 min-w-24 md:min-w-48 md:max-w-56 text-left")
					}}
				>
					{reduceAgents(agents).map((agent) => (
						<Select.Group key={agent.provider} label={agent.provider}>
							{agent.models.map((model, index) => (
								<Select.Item
									key={index}
									value={model.id}
									disabled={!model.enabled}
									className={cn(
										"cursor-pointer",
										!model.enabled && "cursor-not-allowed opacity-50 !bg-transparent !text-muted"
									)}
								>
									<Model
										company={agent.provider}
										modelName={model.name}
										reasoning={model.features.reasoning}
										premium={model.premium}
									/>
								</Select.Item>
							))}
						</Select.Group>
					))}
				</Select>
			</div>

			<div className="flex items-center gap-2">
				<Tooltip content={t("EnhancePrompt")}>
					<Button
						size="icon"
						onClick={() => {
							if (isEnhancing) return;
							enhancePrompt();
						}}
						disabled={isEnhancing || isResponding || isCreatingConversation}
						className={actionButtonClasses("")}
					>
						<RiSparkling2Fill className="w-4 h-4" />
					</Button>
				</Tooltip>
				<Button
					size="icon"
					onClick={handleSubmit}
					disabled={shouldShowSpinner || (!prompt && attachments.length === 0)}
					isLoading={shouldShowSpinner}
					className="bg-colored"
				>
					<ArrowUp01Icon className="w-4 h-4" strokeWidth={3} />
				</Button>
			</div>
		</div>
	);
}


function Model({
	company,
	version,
	modelName,
	reasoning,
	premium
}: {
	company?: string;
	version?: string | null;
	modelName: string;
	reasoning?: boolean;
	premium?: boolean;
}) {
    const t = useTranslations("Toolbar");

	const Icon = (() => {
		switch (company?.toLowerCase()) {
			case 'openai':
				return OpenAI;
			case 'anthropic':
				return Anthropic;
			case 'gemini':
			case 'google':
			case 'google vertex':
			case 'google ai studio':
				return Gemini;
			case 'meta':
				return Meta;
			case 'mistral':
				return Mistral;
			case 'deepseek':
				return DeepSeek;
			case 'qwen':
				return Qwen;
			case 'grok':
				return Grok;
			case 'microsoft':
				return Microsoft;
			case 'replicate':
				return Replicate;
			default:
				return null;
		}
	})();

	return (
		<div className="flex items-center space-x-2">
			{Icon && <Icon size={12} />}
			<div className="flex-1 flex items-center justify-between gap-2">
				<span className="text-sm font-medium line-clamp-1">{modelName}</span>
				{premium && (
					<Tooltip content={t("PremiumModel")}>
						<span className="flex-shrink-0 text-xs text-muted-foreground ml-1 bg-colored/10 text-colored w-5 h-5 flex justify-center items-center rounded-full">
							<CrownIcon size={12} />
						</span>
					</Tooltip>
				)}
			</div>
		</div>
	);
}