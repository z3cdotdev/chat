"use client";

import { cn } from "@colidy/ui-utils";
import Link from "next/link";
import { useSWRApi } from "@/hooks/use-swr-api";
import { useEffect, useMemo, useState } from "react";
import { categories } from "@/constants/categories";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import { RotatingLines } from "@/components/ui/Spinner";
import { Cancel01Icon, Delete02Icon, Edit02Icon, MoreVerticalSquare01Icon, Share01Icon, ThumbsUpIcon } from "hugeicons-react";
import { createContext, useContext } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Dropdown } from "@/components/ui/Dropdown";
import { useSession } from "@/hooks/use-session";
import { toast } from "sonner";
import { Input } from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import { RiSave2Fill } from "@remixicon/react";
import { Select } from "@/components/ui/Select";
import { useTranslations } from "next-intl";

const Z3CContext = createContext<any>(null);

export const useZ3C = () => {
	return useContext(Z3CContext);
}

interface Z3C {
	id: string;
	name: string;
	description: string;
	category: string;
	featured?: boolean;
	popular?: boolean;
	createdBy?: string;
}

export default function Z3Cs() {
	const t = useTranslations("Z3CsPage");

	const { data: session } = useSession();
	const [search, setSearch] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("all");
	const [showingData, setShowingData] = useState<any>(null);
	const [loading, setLoading] = useState(false);
	const [open, setOpen] = useState(false);
	const [isDownloading, setIsDownloading] = useState(false);
	const [downloaded, setDownloaded] = useState(false);
	const [liked, setLiked] = useState(false);
	const [newLiked, setNewLiked] = useState(false);
	const [editMode, setEditMode] = useState(false);
	const [formData, setFormData] = useState<any>({
		name: "",
		description: "",
		profile_image: "",
		instructions: ""
	});
	const [createOpen, setCreateOpen] = useState(false);
	const [createLoading, setCreateLoading] = useState(false);
	const [createForm, setCreateForm] = useState<any>({
		name: "",
		description: "",
		category: categories[0] || "",
		profile_image: "",
		instructions: ""
	});
	const [createError, setCreateError] = useState("");
	const searchParams = useSearchParams();
	const router = useRouter();
	useEffect(() => {
		const appId = searchParams.get("appId");
		if (appId) fetchApp(appId);
	}, [searchParams]);

	const fetchApp = async (appId: string) => {
		setDownloaded(false);
		setOpen(true);
		setShowingData(null);
		setLoading(true);
		setEditMode(false);

		const response = await api(`/z3cs/${appId}`);
		setShowingData(response.data.data);
		if (response.data.data.is_downloaded) setDownloaded(true);
		if (response.data.data.is_liked) setLiked(true);
		setFormData(response.data.data);
		setLoading(false);
	}

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
	} = useSWRApi("/z3cs?search=" + search, {}, {
		revalidateOnFocus: false,
		revalidateOnReconnect: false,
		refreshInterval: 30000
	});


	const handleDownload = async () => {
		setIsDownloading(true);
		api.post(`/z3cs/${showingData?._id.toString()}/download`)
			.then((res) => {
				setDownloaded(res.data.data.is_downloaded);
			})
			.finally(() => {
				setIsDownloading(false);
			});
	}

	const handleEdit = async () => {
		setLoading(true);
		await api.put(`/z3cs/${showingData?._id.toString()}`, formData)
			.then((res) => {
				toast.success(t("Updated"));
				setEditMode(false);
				setShowingData({ ...showingData, ...formData });
				mutate();
			})
			.catch((err) => {
				toast.error(t("UpdateError"));
			})
			.finally(() => {
				setLoading(false);
			});
	}

	return (
		<Z3CContext.Provider value={fetchApp}>
			<div className="flex flex-col w-full max-w-7xl mx-auto p-3 sm:p-6">
				{/* Header */}
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between my-6 sm:mt-0 sm:mb-8 gap-4">
					<div>
						<h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">
							{t("Title")}
						</h1>
						<p className="text-sm sm:text-base text-muted max-w-2xl">
							{t("Description")}
						</p>
					</div>
					<div className="flex items-center gap-3 justify-between sm:justify-end">
						<span className="text-xs sm:text-sm text-muted bg-secondary px-2 sm:px-3 py-1 rounded-full">
							{data?.totalZ3Cs} Z3C
						</span>
						{/* Kullanıcı giriş yaptıysa ve anonim değilse oluştur butonu */}
						{session?.user && !session.user.isAnonymous && (
							<Button className="bg-orange-500 text-white hover:bg-orange-600 transition-all" onClick={() => setCreateOpen(true)}>
								{t("CreateNew")}
							</Button>
						)}
					</div>
				</div>

				{/* Arama */}
				<div className="gap-2 bg-primary pt-6">
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
				</div>

				{isLoading ? (
					<LoadingState />
				) : (
					<div className="flex flex-col gap-12">
						{search ? (
							<>
								<CardGroup
									title={t("SearchTitle", { search })}
									type="featured"
									data={{
										isLoading,
										Z3Cs: data
									}}
									observeId="mostLikedAllTimes"
								/>
							</>
						) : (
							<>

								{/* Featured Section */}
								<CardGroup
									title={t("MostLiked")}
									type="featured"
									data={{
										isLoading,
										Z3Cs: data?.mostLikedAllTimes
									}}
									observeId="mostLikedAllTimes"
								/>

								<CardGroup
									title={t("MostUsed")}
									type="featured"
									data={{
										isLoading,
										Z3Cs: data?.mostUsedAllTimes
									}}
									observeId="mostUsedAllTimes"
								/>

								<CardGroup
									title={t("MostDownloaded")}
									type="featured"
									data={{
										isLoading,
										Z3Cs: data?.mostDownloadedAllTimes
									}}
									observeId="mostDownloadedAllTimes"
								/>

								{/* Tüm Z3C'ler */}
								{data?.categories.filter((category: any) => category.id).map((category: any) => (
									<CardGroup
										key={category.id}
										title={t("Categories." + category.id)}
										type="standart"
										data={{
											isLoading,
											Z3Cs: category.z3cs
										}}
										observeId={category.id}
									/>
								))}
							</>

						)}
					</div>
				)}
			</div>


			<Dialog
				open={open}
				onOpenChange={setOpen}
			>
				<Dialog.Content
					className="max-h-[calc(100vh-10rem)] overflow-y-auto w-full h-full space-y-6"
					hiddenHeader
				>
					{(loading && !showingData) ? (
						<div className="flex items-center justify-center h-96">
							<RotatingLines size={48} color="currentColor" />
						</div>
					) : (
						<div className="flex flex-col gap-4 max-w-sm mx-auto w-full py-12">
							<div className="w-full flex flex-col items-center text-center">
								{editMode ? (
									<div className="w-full flex items-center justify-start gap-2 mb-4">
										{formData?.profile_image ? (
											<div className="size-20">
												<img className="w-full object-contain rounded-full" src={formData?.profile_image} alt={formData?.name} />
											</div>
										) : (
											<div className="group" data-hs-file-upload-previews="" data-hs-file-upload-pseudo-trigger="">
												<span className="group-has-[div]:hidden flex shrink-0 justify-center items-center size-20 border-2 border-dotted border-gray-300 text-gray-400 cursor-pointer rounded-full hover:bg-gray-50 dark:border-neutral-700 dark:text-neutral-600 dark:hover:bg-neutral-700/50">
													<svg className="shrink-0 size-7" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
														<circle cx="12" cy="12" r="10"></circle>
														<circle cx="12" cy="10" r="3"></circle>
														<path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"></path>
													</svg>
												</span>
											</div>
										)}
										<input
											id="upload-photo"
											type="file"
											className="opacity-0 pointer-events-none w-0 h-0"
											accept="image/*"
											onChange={async (e) => {
												const file = e.target.files?.[0];
												if (!file) return;

												const formData = new FormData();
												formData.append('file', file);
												formData.append('name', file.name);

												const response = await api.post('/upload?filename=' + file.name, formData, {
													headers: {
														'Content-Type': 'multipart/form-data',
													},
												});

												if (response.data) {
													setFormData({ ...formData, profile_image: response.data.url });
												} else {
													toast.error(t("PhotoError"));
												}
											}}
										/>
										{/* @ts-ignore */}
										<Button as="label" htmlFor="upload-photo" className="rounded-full h-10 px-4 bg-secondary hover:bg-accent text-foreground relative">
											{t("UploadPhoto")}
										</Button>
									</div>
								) : (
									showingData?.profile_image && (
										<img
											src={showingData?.profile_image}
											alt={showingData?.name}
											width={72}
											height={72}
											className="rounded-full mb-4"
										/>
									)
								)}
								{editMode ? (
									<Input
										value={formData?.name}
										onChange={(e) => setFormData({ ...formData, name: e.target.value })}
									/>
								) : (
									<h2 className="text-xl font-bold text-foreground">
										{showingData?.name}
									</h2>
								)}
								<div className="flex items-center gap-1 my-3">
									<img
										src={showingData?.author?.image}
										alt={showingData?.author?.username}
										width={16}
										height={16}
										className="rounded-full"
									/>
									<span className="text-sm text-foreground">
										{t("Author", { author: showingData?.author?.username })}
									</span>
								</div>
								{editMode ? (
									<Input
										value={formData?.description}
										onChange={(e) => setFormData({ ...formData, description: e.target.value })}
									/>
								) : (
									<p className="text-sm text-muted leading-relaxed max-w-md">
										{showingData?.description}
									</p>
								)}
							</div>

							<div className="w-full flex justify-center items-center gap-8 py-6">
								<div className="text-center">
									<div className="text-2xl font-bold text-foreground">
										{new Intl.NumberFormat("tr-TR", {
											maximumFractionDigits: 1
										}).format(+(showingData?.likes || 0) + +(newLiked ? (liked ? 1 : (showingData?.likes === 0 ? 0 : -1)) : 0))}
									</div>
									<div className="text-xs text-muted">
										{t("Likes")}
									</div>
								</div>
								<div className="text-center">
									<div className="text-2xl font-bold text-foreground">
										#{showingData?.placement}
									</div>
									<div className="text-xs text-muted">
										{t("Category", { category: showingData?.category })}
									</div>
								</div>
								<div className="text-center">
									<div className="text-2xl font-bold text-foreground">
										{showingData?.conversations > 999 ? `${Math.floor(showingData?.conversations / 1000)}K+` : showingData?.conversations}
									</div>
									<div className="text-xs text-muted">
										{t("Conversations")}
									</div>
								</div>
							</div>

							<div className="w-full">
								<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
									{t("Instructions")}
								</h3>
								{editMode ? (
									<Textarea
										value={formData?.instructions}
										onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
									/>
								) : (
									<div className="space-y-2 bg-secondary rounded-xl p-4">
										<p className="text-sm text-muted">
											{showingData?.instructions}
										</p>
									</div>
								)}
							</div>

							{editMode ? (
								<div className="w-full flex gap-2">
									<Button
										className="rounded-full h-10 px-4 bg-secondary hover:bg-accent text-foreground"
										onClick={() => {
											setEditMode(false);
											setFormData(showingData);
										}}
									>
										<Cancel01Icon className="w-4 h-4" />
										<span>{t("Cancel")}</span>
									</Button>
									<Button className="flex-1 rounded-full px-4 h-10" onClick={handleEdit}>
										<RiSave2Fill className="w-4 h-4" />
										<span>{t("SaveChanges")}</span>
									</Button>
								</div>
							) : (
								<div className="flex items-center gap-2">
									<Button
										className={cn("rounded-full flex-1 h-10 relative", {
											"bg-green-500 text-foreground": downloaded
										})}
										onClick={handleDownload}
										isLoading={isDownloading}
									>
										{downloaded ? t("Downloaded") : t("Download")}
									</Button>
									<Dropdown>
										<Dropdown.Trigger asChild>
											<Button className="rounded-full h-10 w-10 flex-shrink-0 bg-secondary hover:bg-accent text-foreground" size="icon">
												<MoreVerticalSquare01Icon strokeWidth={2} fill="currentColor" className="w-4 h-4" />
											</Button>
										</Dropdown.Trigger>
										<Dropdown.Content align="end">
											<Dropdown.Item
												className="flex items-center justify-start gap-2"
												onClick={() => {
													api.post(`/z3cs/${showingData?._id.toString()}/like`)
														.then((res) => {
															setNewLiked(true);
															setLiked(res.data.data.is_liked);
														});
												}}
											>
												<ThumbsUpIcon className="w-4 h-4" fill={liked ? "currentColor" : "none"} />
												<span>
													{liked ? t("Liked") : t("Like")}
												</span>
											</Dropdown.Item>
											<Dropdown.Item
												onClick={() => {
													navigator.clipboard.writeText(window.location.href + '?appId=' + showingData?._id.toString());
												}}
												className="flex items-center justify-start gap-2"
											>
												<Share01Icon className="w-4 h-4" />
												<span>{t("Share")}</span>
											</Dropdown.Item>
											{session?.user?.id === showingData?.author?._id && (
												<>
													<Dropdown.Item
														onClick={() => {
															api.delete(`/z3cs/${showingData?._id.toString()}`)
																.then((res) => {
																	if (res.data.success) {
																		toast.success(t("Deleted"));
																		setOpen(false);
																		mutate();
																	} else {
																		toast.error(t("DeleteError"));
																	}
																});
														}}
														className="flex items-center justify-start gap-2"
													>
														<Delete02Icon className="w-4 h-4" />
														<span>{t("Delete")}</span>
													</Dropdown.Item>
													<Dropdown.Item
														onClick={() => {
															setEditMode(true);
														}}
														className="flex items-center justify-start gap-2"
													>
														<Edit02Icon className="w-4 h-4" />
														<span>{t("Edit")}</span>
													</Dropdown.Item>
												</>
											)}
										</Dropdown.Content>
									</Dropdown>
								</div>
							)}

							{showingData?.author?.apps?.length > 0 && (
								<div className="w-full flex flex-col gap-2 mt-4">
									<p className="text-sm text-muted">
										{t("MoreFrom", { author: showingData?.author?.username })}
									</p>
									<div className="flex flex-col gap-1">
										{showingData?.author?.apps?.map((app: any) => (
											<div
												key={app._id.toString()}
												className="-mx-4 flex flex-col items-start gap-1 px-4 py-3 rounded-xl bg-secondary hover:bg-accent transition-all cursor-pointer"
												onClick={() => fetchApp(app._id.toString())}
											>
												<div className="flex items-center gap-1">
													<img src={app.profile_image} alt={app.name} width={16} height={16} className="rounded-full" />
													<p className="text-sm text-foreground">{app.name}</p>
												</div>
												<p className="text-xs text-muted">
													{app.description}
												</p>
											</div>
										))}
									</div>
								</div>
							)}
						</div>
					)}
				</Dialog.Content>
			</Dialog>

			{/* Create Modal */}
			<Dialog open={createOpen} onOpenChange={setCreateOpen}>
				<Dialog.Content className="max-w-md w-full" titleChildren={"Yeni Z3C Oluştur"} descriptionChildren={"Z3C oluşturmak için aşağıdaki alanları doldurun."}>
					<div className="flex flex-col gap-3">
						<Input
							placeholder="Z3C adı"
							value={createForm.name}
							onChange={e => setCreateForm({ ...createForm, name: e.target.value })}
						/>
						<Input
							placeholder="Açıklama"
							value={createForm.description}
							onChange={e => setCreateForm({ ...createForm, description: e.target.value })}
						/>
						<Select
							value={createForm.category}
							onValueChange={value => setCreateForm({ ...createForm, category: value })}
						>
							{categories.map((cat: any) => (
								<Select.Item key={cat} value={cat}>{t("Categories." + cat)}</Select.Item>
							))}
						</Select>

						{/* Profil görseli alanı: upload ve url birlikte */}
						<div className="flex items-center justify-start gap-2">
							{createForm.profile_image ? (
								<div className="size-20">
									<img className="w-full object-contain rounded-full" src={createForm.profile_image} alt="Profil" />
								</div>
							) : (
								<div className="group" data-hs-file-upload-previews="" data-hs-file-upload-pseudo-trigger="">
									<span className="group-has-[div]:hidden flex shrink-0 justify-center items-center size-20 border-2 border-dotted border-gray-300 text-gray-400 cursor-pointer rounded-full hover:bg-gray-50 dark:border-neutral-700 dark:text-neutral-600 dark:hover:bg-neutral-700/50">
										<svg className="shrink-0 size-7" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
											<circle cx="12" cy="12" r="10"></circle>
											<circle cx="12" cy="10" r="3"></circle>
											<path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"></path>
										</svg>
									</span>
								</div>
							)}
							<input
								id="create-upload-photo"
								type="file"
								className="opacity-0 pointer-events-none w-0 h-0"
								accept="image/*"
								onChange={async (e) => {
									const file = e.target.files?.[0];
									if (!file) return;

									setCreateLoading(true);
									const formData = new FormData();
									formData.append('file', file);
									formData.append('name', file.name);

									try {
										const response = await api.post('/upload?filename=' + file.name, formData, {
											headers: {
												'Content-Type': 'multipart/form-data',
											},
										});

										if (response.data) {
											setCreateForm({ ...createForm, profile_image: response.data.url });
										} else {
											toast.error(t("PhotoError"));
										}
									} catch (error) {
										toast.error(t("PhotoError"));
									} finally {
										setCreateLoading(false);
									}
								}}
							/>
							{/* @ts-ignore */}
							<Button as="label" htmlFor="create-upload-photo" className="rounded-full h-10 px-4 bg-secondary hover:bg-accent text-foreground relative">
								{t("UploadPhoto")}
							</Button>
						</div>
						<Textarea
							placeholder="Talimatlar"
							value={createForm.instructions}
							onChange={e => setCreateForm({ ...createForm, instructions: e.target.value })}
						/>
						{createError && <div className="text-red-500 text-sm">{createError}</div>}
					</div>
					<div className="flex gap-2 mt-6">
						<Button className="rounded-full h-10 px-4 bg-secondary hover:bg-accent text-foreground" onClick={() => setCreateOpen(false)} disabled={createLoading}>{t("Cancel")}</Button>
						<Button className="flex-1 bg-orange-500 text-white hover:bg-orange-600" isLoading={createLoading} onClick={async () => {
							setCreateLoading(true);
							setCreateError("");
							try {
								const res = await api.post("/z3cs", createForm);
								if (res.data.success) {
									setCreateOpen(false);
									setCreateForm({ name: "", description: "", category: categories[0] || "", profile_image: "", instructions: "" });
									mutate();
									toast.success(t("Created"));
								} else {
									setCreateError(t("CreateError"));
								}
							} catch (e) {
								setCreateError(t("CreateError"));
							} finally {
								setCreateLoading(false);
							}
						}}>
							Oluştur
						</Button>
					</div>
				</Dialog.Content>
			</Dialog>
		</Z3CContext.Provider >
	);
}

function EmptyState({ category }: { category: string }) {
	const t = useTranslations("Z3CsPage");

	return (
		<div className="flex flex-col items-center justify-center h-64 border border-dotted border-border rounded-2xl transition-all duration-300 hover:border-orange-200/50">
			<div className="w-16 h-16 bg-secondary rounded-full mb-4 opacity-50 transition-all duration-300" />
			<h3 className="text-muted-foreground text-lg font-medium mb-2">{t("NoZ3C")}</h3>
			<p className="text-muted-foreground text-sm text-center max-w-md">
				{t("NoZ3CDescription", { category })}
			</p>
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

function CardGroup({
	title,
	type = "standart",
	data,
	observeId
}: {
	title: string,
	type?: "standart" | "featured",
	data: any,
	observeId?: string
}) {
	const { isLoading, Z3Cs, } = data;

	return (
		<div className="flex-1" data-observe-id={observeId}>
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-lg sm:text-xl font-bold text-foreground">
					{title}
				</h2>
			</div>

			{isLoading ? (
				<LoadingState />
			) : (
				!Z3Cs || Z3Cs?.length === 0 ? (
					<EmptyState category={title || ""} />
				) : (
					type === "standart" ? (
						<StandartCard data={data.Z3Cs} />
					) : (
						<StandartCard data={data.Z3Cs} />
					)
				)
			)}
		</div>
	);
}

function StandartCard({ data }: { data: any }) {
	const fetchApp = useZ3C();
	const t = useTranslations("Z3CsPage");

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
			{data.map((z3c: any, index: number) => (
				<div
					key={z3c._id.toString()}
					className="bg-secondary hover:bg-tertiary border-2 border-transparent rounded-xl sm:rounded-2xl p-4 sm:p-5 transition-all duration-300 cursor-pointer"
					onClick={() => fetchApp(z3c._id.toString())}
				>
					{/* Header */}
					<div className="flex items-start justify-between mb-3">
						<div className="flex items-center gap-2">
							{z3c.profile_image && (
								<img
									src={z3c.profile_image}
									alt={z3c.name}
									width={36}
									height={36}
									className="rounded-full"
								/>
							)}
							<h3 className="font-bold text-sm sm:text-base text-foreground group-hover:text-orange-600 transition-colors duration-200 flex-1 pr-2">
								{z3c.name}
							</h3>
						</div>
						{z3c.popular && (
							<span className="text-xs bg-orange-500/10 text-orange-600 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
								{t("Popular")}
							</span>
						)}
					</div>

					{/* Description */}
					<p className="text-xs sm:text-sm text-muted leading-relaxed mb-4 line-clamp-3 text-left">
						{z3c.description}
					</p>

					{/* Footer */}
					<div className="flex items-center justify-between">
						<span className="text-xs text-muted">
							{t("Author", { author: z3c.author.username })}
						</span>
					</div>
				</div>
			))}
		</div>
	)
}