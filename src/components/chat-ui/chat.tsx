"use client";

import { useClientFunctions } from "@/hooks/use-client-functions";
import PromptInput from "@/components/forms/PromptInput";
import { useScrollDown } from "@/hooks/use-scroll-down";
import Messages from "@/components/chat-ui/messages";
import { ArrowDown01Icon } from "hugeicons-react";
import { RotatingLines } from "@/ui/Spinner";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function Chat({
	response,
	conversationId,
	isTemporary = false
}: {
	response?: any;
	conversationId?: string;
	isTemporary?: boolean;
}) {
	const [isResponding, setIsResponding] = useState(response?.isResponding || false);
	const { scrollToBottom, autoScroll, isNeedScroll } = useScrollDown();
	const isShared = response?.is_shared || false;

	return (
		<div className="flex flex-col h-full w-full">
			{/* Messages Container with Custom Scroll */}
			<div className="w-full h-full overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border hover:scrollbar-thumb-border-hover">
				<div className="w-full max-w-3xl mx-auto">
					<Messages isShared={isShared} />
				</div>
			</div>

			{/* Bottom Input Area */}
			<div className="flex-shrink-0 w-full">
				<div className="w-full max-w-3xl mx-auto">
					<PromptBase
						isNeedScroll={isNeedScroll}
						scrollToBottom={scrollToBottom}
						autoScroll={autoScroll}
						isShared={isShared}
						response={response}
						conversationId={conversationId}
						isResponding={isResponding}
						setIsResponding={setIsResponding}
					/>
				</div>
			</div>
		</div>
	);
}

function PromptBase({
	isNeedScroll,
	scrollToBottom,
	autoScroll,
	isShared,
	response,
	conversationId,
	isResponding,
	setIsResponding
}: any) {
	const {
		fork: {
			handleFork,
			isForking
		}
	} = useClientFunctions();

    const t = useTranslations("ChatUI");

	return (
		<div className="flex flex-col gap-2">
			{isNeedScroll && (
				<button
					onClick={scrollToBottom}
					disabled={autoScroll}
					className="cursor-pointer flex items-center gap-2 bg-border/10 backdrop-brightness-110 backdrop-blur-lg w-fit px-4 py-2 rounded-full text-sm text-muted-foreground hover:bg-zinc-500/20 transition-colors duration-200 ease-in-out mx-auto"
				>
					<ArrowDown01Icon size={16} />
					{t("ScrollToBottom")}
				</button>
			)}

			{(!isShared) ? (
				<PromptInput
					className="max-w-3xl w-full !rounded-b-none"
					isResponding={isResponding || false}
					setIsResponding={setIsResponding}
				/>
			) : (
				conversationId && (
					<div className="w-full bg-secondary rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
						<p className="text-sm text-muted-foreground">
							{t("SharedChat")}
						</p>
						<button
							onClick={() => handleFork(conversationId, response?.lastMessage || null)}
							className="bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 transition-colors duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
							disabled={isForking}
						>
							{isForking ? (
								<>
									<RotatingLines size={16} color="currentColor" />    
									<span>{t("Copying")}</span>
								</>
							) : (
								t("CopyChat")
							)}
						</button>
					</div>
				)
			)}
		</div>
	);
}