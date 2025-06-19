"use client";

import { cn } from "@colidy/ui-utils";
import Link from "next/link";
import { useSWRApi } from "@/hooks/use-swr-api";
import { useMemo, useState } from "react";
import { Download01Icon, EyeIcon, FileAttachmentIcon, DocumentAttachmentIcon, Image01Icon } from "hugeicons-react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

export default function Library() {
	const {
		data,
		isLoading,
		error,
		mutate
	} = useSWRApi("/library", {}, {
		revalidateOnFocus: false,
		revalidateOnReconnect: false,
		refreshInterval: 30000
	});

    const t = useTranslations("LibraryPage");

	const [search, setSearch] = useState("");
	const files = data?.data || [];

	const filteredFiles = useMemo(() => {
		if (!files) return [];
		return files.filter((file: any) => {
			if (!search) return true;
			return file.name?.toLowerCase().includes(search.toLowerCase());
		});
	}, [files, search]);

	const getFileIcon = (contentType: string) => {
		if (contentType.includes('pdf')) return <DocumentAttachmentIcon className="w-8 h-8 text-red-500" />;
		if (contentType.includes('image')) return <Image01Icon className="w-8 h-8 text-blue-500" />;
		return <FileAttachmentIcon className="w-8 h-8 text-gray-500" />;
	};

	const getFilePreview = (file: any) => {
		if (file.contentType.includes('image')) {
			return (
				<img
					src={file.url}
					alt={file.name}
					className="w-full h-32 sm:h-40 object-cover rounded-t-xl sm:rounded-t-xl"
					loading="lazy"
				/>
			);
		}
		return (
			<div className="w-full h-32 sm:h-40 bg-secondary/50 rounded-t-xl sm:rounded-t-xl flex items-center justify-center">
				{getFileIcon(file.contentType)}
			</div>
		);
	};

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
				<div className="flex items-center gap-3 justify-between sm:justify-end">
					<span className="text-xs sm:text-sm text-muted bg-secondary px-2 sm:px-3 py-1 rounded-full">
						{t("FileCount", { count: filteredFiles.length })}
					</span>
					<Link href="/" className="text-xs sm:text-sm text-orange-500 hover:underline">
						{t("BackToHome")}
					</Link>
				</div>
			</div>

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

			{/* Dosya Grid */}
			<div className="flex-1 overflow-y-auto">
				{isLoading ? (
					<LoadingState />
				) : (
					<>
						{!filteredFiles || filteredFiles?.length === 0 ? (
							<EmptyState />
						) : (
							<motion.div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-6">
								{filteredFiles.map((file: any, index: number) => (
									<motion.div
										key={file.name || index}
										className="relative group"
										initial={{ opacity: 0, scale: 0.8 }}
										animate={{ opacity: 1, scale: 1 }}
										transition={{ delay: index * 0.1 }}
									>
										{/* Dosya Kartı */}
										<div className="bg-secondary hover:bg-tertiary border-2 border-transparent hover:border-orange-200/30 rounded-xl sm:rounded-2xl overflow-hidden transition-all">
											{/* Preview */}
											{getFilePreview(file)}

											{/* Dosya Bilgileri */}
											<div className="p-3 sm:p-4">
												<h3 className="font-medium text-xs sm:text-sm truncate text-foreground mb-1">
													{file.name}
												</h3>
												<p className="text-muted-foreground text-xs mb-3 sm:mb-4">
													{file.contentType.split('/')[1]?.toUpperCase() || 'DOSYA'}
												</p>

												{/* Aksiyon Butonları */}
												<div className="flex flex-col sm:flex-row items-center gap-2">
													<button
														onClick={() => window.open(file.url + '?download=1', '_blank')}
														className="w-full flex items-center justify-center gap-1 sm:gap-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs font-medium transition-colors"
													>
														<Download01Icon className="w-3 h-3" />
														<span className="hidden sm:inline">{t("Download")}</span>
														<span className="sm:hidden">{t("Download")}</span>
													</button>
													<button
														onClick={() => window.open(file.url, '_blank')}
														className="w-full flex items-center justify-center gap-1 sm:gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs font-medium transition-colors"
													>
														<EyeIcon className="w-3 h-3" />
														<span className="hidden sm:inline">{t("Open")}</span>
														<span className="sm:hidden">{t("Open")}</span>
													</button>
												</div>
											</div>
										</div>
									</motion.div>
								))}
							</motion.div>
						)}
					</>
				)}
			</div>
		</div>
	);
}

function EmptyState() {
    const t = useTranslations("LibraryPage");
    
	return (
		<div className="flex flex-col items-center justify-center h-64 border border-dotted border-border rounded-2xl">
			<FileAttachmentIcon className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
			<h3 className="text-muted-foreground text-lg font-medium mb-2">{t("NoFiles")}</h3>
			<p className="text-muted-foreground text-sm text-center max-w-md">
				{t("NoFilesDescription")}
			</p>
			<Link
				href="/"
				className="mt-4 text-orange-500 hover:underline text-sm font-medium"
			>
				{t("NewChat")} →
			</Link>
		</div>
	);
}

function LoadingState() {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
			{Array.from({ length: 10 }).map((_, index) => (
				<div key={index} className="bg-secondary rounded-2xl overflow-hidden">
					<div className="w-full h-40 bg-secondary/50 shimmer" />
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