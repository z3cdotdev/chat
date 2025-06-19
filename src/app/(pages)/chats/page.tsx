"use client";

import { cn } from "@colidy/ui-utils";
import Link from "next/link";
import { useSWRApi } from "@/hooks/use-swr-api";
import { useMemo, useState } from "react";
import { api } from "@/lib/api";
import { Delete01Icon, BubbleChatBlockedIcon, MessageMultiple01Icon, Tick02Icon } from "hugeicons-react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { useClientFunctions } from "@/hooks/use-client-functions";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export default function Chat() {
	const {
		data,
		isLoading,
		error,
		mutate
	} = useSWRApi("/conversations", {}, {
		revalidateOnFocus: false,
		revalidateOnReconnect: false,
		refreshInterval: 30000
	});

	const [search, setSearch] = useState("");
	const [selectedConversations, setSelectedConversations] = useState<string[]>([]);
	const [isBulkDeleting, setIsBulkDeleting] = useState(false);
	const conversations = data?.conversations || [];
	const { deleteConversation: { deleteConversation, isDeleting } } = useClientFunctions();
    const t = useTranslations("ChatsPage");
    
	const filteredConversations = useMemo(() => {
		if (!conversations) return [];
		return conversations.filter((conversation: any) => {
			if (!search) return true;
			return conversation.title?.toLowerCase().includes(search.toLowerCase());
		});
	}, [conversations, search]);

	const handleSelectConversation = (conversationId: string) => {
		setSelectedConversations(prev => {
			if (prev.includes(conversationId)) {
				return prev.filter(id => id !== conversationId);
			} else {
				return [...prev, conversationId];
			}
		});
	};

	const handleSelectAll = () => {
		if (selectedConversations.length === filteredConversations.length) {
			setSelectedConversations([]);
		} else {
			setSelectedConversations(filteredConversations.map((conv: any) => conv._id));
		}
	};

	const handleBulkDelete = async () => {
		if (selectedConversations.length === 0) return;

		setIsBulkDeleting(true);
		try {
			// Promise.all kullanarak toplu silme işlemi
			const deletePromises = selectedConversations.map(conversationId =>
				api.delete(`/conversation/${conversationId}/delete`)
			);

			await Promise.all(deletePromises);

			toast.success(t("BulkDeleted", { count: selectedConversations.length }));
			setSelectedConversations([]);
			mutate(); // Listeyi yenile
		} catch (error) {
			console.error('Toplu silme hatası:', error);
			toast.error(t("BulkDeleteError"));
		} finally {
			setIsBulkDeleting(false);
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("tr-TR", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit"
		});
	};

	const isAllSelected = selectedConversations.length === filteredConversations.length && filteredConversations.length > 0;
	const isSomeSelected = selectedConversations.length > 0;

	return (
		<div className="flex flex-col h-full w-full max-w-6xl mx-auto p-3 sm:p-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between my-6 sm:mt-0 sm:mb-8 gap-4">
				<div>
					<h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">
						{t("Title")}
					</h1>
					<p className="text-sm sm:text-base text-muted">
						{t("Description")}
					</p>
				</div>
				<div className="flex items-center gap-3">
					<span className="text-xs sm:text-sm text-muted bg-secondary px-2 sm:px-3 py-1 rounded-full">
						{t("ChatCount", { count: filteredConversations.length })}
					</span>
					<Link href="/" className="text-xs sm:text-sm text-orange-500 hover:underline">
						{t("NewChat")}
					</Link>
				</div>
			</div>

			{/* Kontrollar */}
			{filteredConversations.length > 0 && (
				<div className="h-auto sm:h-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6 p-3 sm:p-4 bg-secondary/30 border border-border rounded-xl sm:rounded-2xl backdrop-blur-sm">
					<div className="flex items-center gap-4">
						<motion.button
							className="flex items-center gap-3 cursor-pointer group"
							onClick={handleSelectAll}
							whileTap={{ scale: 0.95 }}
						>
							<div className={cn(
								"w-4 h-4 rounded border-2 transition-all duration-200 flex items-center justify-center",
								isAllSelected
									? "bg-colored border-colored text-white"
									: "border-border hover:border-colored bg-input"
							)}>
								{isAllSelected ? (
									<Tick02Icon className="w-2.5 h-2.5" />
								) : <span />}
							</div>
							<span className="text-xs sm:text-sm text-foreground font-medium">
								{isAllSelected ? t("RemoveAll") : t("SelectAll")}
							</span>
						</motion.button>

						{isSomeSelected && (
							<motion.div
								initial={{ opacity: 0, scale: 0.8 }}
								animate={{ opacity: 1, scale: 1 }}
								className="px-2 sm:px-3 py-1.5 bg-colored/10 text-colored text-xs font-medium rounded-full border border-colored/20"
							>
								{t("SelectedCount", { count: selectedConversations.length })}
							</motion.div>
						)}
					</div>

					{isSomeSelected && (
						<motion.div
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: 20 }}
						>
							<Dialog>
								<Dialog.Trigger asChild>
									<Button
										variant="destructive"
										disabled={isBulkDeleting}
										className="text-xs px-3 sm:px-4 py-2 h-8 sm:h-9"
									>
										<Delete01Icon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
										<span className="hidden sm:inline">{t("DeleteSelected", { count: selectedConversations.length })}</span>
										<span className="sm:hidden">{t("Delete", { count: selectedConversations.length })}</span>
									</Button>
								</Dialog.Trigger>
								<Dialog.Content
									titleChildren={t("DeleteSelectedTitle")}
									descriptionChildren={t("DeleteSelectedDescription")}
								>
									<div className="flex items-center justify-end gap-2 mt-4">
										<Dialog.Close asChild>
											<Button variant="link" className="text-muted">
												{t("Cancel")}
											</Button>
										</Dialog.Close>
										<Button
											variant="destructive"
											onClick={handleBulkDelete}
											isLoading={isBulkDeleting}
											disabled={isBulkDeleting}
										>
											{t("DeleteConversation", { count: selectedConversations.length })}
										</Button>
									</div>
								</Dialog.Content>
							</Dialog>
						</motion.div>
					)}
				</div>
			)}

			{/* Arama */}
			<input
				className={cn(
					"w-full rounded-xl sm:rounded-2xl bg-input outline-none border p-3 sm:p-4 text-sm text-foreground resize-none mb-4 sm:mb-6",
					"focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-background",
					"transition-all duration-200 ease-in-out hover:border-border-hover focus:!bg-input"
				)}
				placeholder={t("SearchPlaceholder")}
				type="text"
				value={search}
				onChange={(e) => setSearch(e.target.value)}
			/>

			{/* Sohbet Grid */}
			<div className="flex-1 overflow-y-auto">
				{isLoading ? (
					<LoadingState />
				) : (
					<>
						{!filteredConversations || filteredConversations?.length === 0 ? (
							<EmptyState />
						) : (
							<motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
								{filteredConversations.map((conversation: any, index: number) => {
									const isSelected = selectedConversations.includes(conversation._id);
									return (
										<motion.div
											key={conversation._id || index}
											className="relative group"
											initial={{ opacity: 0, scale: 0.8 }}
											animate={{ opacity: 1, scale: 1 }}
											transition={{ delay: index * 0.05 }}
										>
											{/* Checkbox */}
											<button
												className="absolute top-3 left-3 z-20 flex items-center cursor-pointer"
												onClick={(e) => {
													e.preventDefault();
													e.stopPropagation();
													handleSelectConversation(conversation._id);
												}}
											>
												<div className={cn(
													"w-4 h-4 rounded border-2 transition-all duration-200 flex items-center justify-center",
													isSelected
														? "bg-colored border-colored text-white"
														: "border-border hover:border-colored bg-background"
												)}>
													{isSelected ? (
														<Tick02Icon className="w-2.5 h-2.5" />
													) : <span />}
												</div>
											</button>

											{/* Sohbet Kartı */}
											<Link href={`/chats/${conversation._id}`} className="block">
												<div
													className={cn(
														"bg-secondary hover:bg-tertiary border-2 rounded-xl sm:rounded-2xl overflow-hidden transition-all flex flex-col pl-10 sm:pl-12 pr-8 sm:pr-10",
														isSelected
															? "border-colored/50 bg-colored/10"
															: "border-transparent hover:border-colored/30"
													)}
												>

													{/* Content */}
													<div className="flex items-start gap-3 py-3 sm:py-4">
														<div className="w-6 sm:w-8 h-6 sm:h-8 bg-colored/10 rounded-lg flex items-center justify-center flex-shrink-0">
															<MessageMultiple01Icon className="w-3 sm:w-4 h-3 sm:h-4 text-colored" />
														</div>
														<div>
															<h3 className={cn(
																"font-medium text-xs sm:text-sm truncate leading-tight transition-colors",
																isSelected ? "text-colored" : "text-foreground"
															)}>
																{conversation.title || t("NewChatLabel")}
															</h3>
															<p className="text-muted text-xs mt-auto">
																{formatDate(conversation.updatedAt)}
															</p>
														</div>
													</div>
												</div>
											</Link>

											{/* Delete Button */}
											<Dialog>
												<Dialog.Trigger asChild>
													<button
														onClick={(e) => e.stopPropagation()}
														className="cursor-pointer absolute top-3 right-3 w-6 sm:w-7 h-6 sm:h-7 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
													>
														<Delete01Icon className="w-3 h-3" />
													</button>
												</Dialog.Trigger>
												<Dialog.Content
													titleChildren={t("DeleteConversationTitle")}
													descriptionChildren={t("DeleteConversationDescription")}
												>
													<div className="flex items-center justify-end gap-2 mt-4">
														<Dialog.Close asChild>
															<Button variant="link" className="text-muted">
																{t("Cancel")}
															</Button>
														</Dialog.Close>
														<Button
															variant="destructive"
															onClick={() => {
																deleteConversation(conversation._id, () => {
																	mutate();
																});
															}}
															isLoading={isDeleting}
															disabled={isDeleting}
														>
															{t("DeleteConversation", { count: 1 })}
														</Button>
													</div>
												</Dialog.Content>
											</Dialog>
										</motion.div>
									);
								})}
							</motion.div>
						)}
					</>
				)}
			</div>
		</div>
	);
}

function EmptyState() {
    const t = useTranslations("ChatsPage");
    
	return (
		<div className="flex flex-col items-center justify-center h-64 border border-dotted border-border rounded-xl sm:rounded-2xl col-span-1 lg:col-span-2">
			<BubbleChatBlockedIcon className="w-12 sm:w-16 h-12 sm:h-16 text-muted-foreground mb-3 sm:mb-4 opacity-50" />
			<h3 className="text-muted-foreground text-base sm:text-lg font-medium mb-2">{t("NoChats")}</h3>
			<p className="text-muted-foreground text-xs sm:text-sm text-center max-w-md px-4 sm:px-0">
				{t("NoChatsDescription")}
			</p>
			<Link
				href="/"
				className="mt-3 sm:mt-4 text-orange-500 hover:underline text-xs sm:text-sm font-medium"
			>
				{t("NewChat")} →
			</Link>
		</div>
	);
}

function LoadingState() {
	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
			{Array.from({ length: 6 }).map((_, index) => (
				<div key={index} className="bg-secondary rounded-xl sm:rounded-2xl overflow-hidden h-28 sm:h-32">
					<div className="p-3 sm:p-4 space-y-3 pl-10 sm:pl-12">
						<div className="flex items-center gap-3">
							<div className="w-6 sm:w-8 h-6 sm:h-8 bg-secondary/50 shimmer rounded-lg" />
							<div className="h-3 sm:h-4 bg-secondary/50 shimmer rounded flex-1" />
						</div>
						<div className="h-2 sm:h-3 bg-secondary/50 shimmer rounded w-1/2 mt-auto" />
					</div>
				</div>
			))}
		</div>
	);
}