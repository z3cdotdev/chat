'use client';

import { useSWRApi } from "@/hooks/use-swr-api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useTranslations } from "next-intl";

export default function ApiKeysPage() {
    const t = useTranslations("SettingsApiKeysPage");

	const [submitable, setSubmittable] = useState(false);
	const [submiting, setSubmiting] = useState(false);

	const { data, mutate, isLoading } = useSWRApi("/user/api-keys");

	const [openai, setOpenai] = useState("");
	const [gemini, setGemini] = useState("");
	const [anthropic, setAnthropic] = useState("");
	const [replicate, setReplicate] = useState("");

	useEffect(() => {
		setSubmittable(
			(openai !== data?.data?.find((k: any) => k.provider === 'openai')?.key) ||
			(gemini !== data?.data?.find((k: any) => k.provider === 'gemini')?.key) ||
			(anthropic !== data?.data?.find((k: any) => k.provider === 'anthropic')?.key) ||
			(replicate !== data?.data?.find((k: any) => k.provider === 'replicate')?.key)
		);
	}, [openai, gemini, anthropic, replicate]);

	const handleReset = () => {
		if (!openai) setOpenai(data?.data?.find((k: any) => k.provider === 'openai')?.key || '');
		if (!gemini) setGemini(data?.data?.find((k: any) => k.provider === 'gemini')?.key || '');
		if (!anthropic) setAnthropic(data?.data?.find((k: any) => k.provider === 'anthropic')?.key || '');
		if (!replicate) setReplicate(data?.data?.find((k: any) => k.provider === 'replicate')?.key || '');
	};

	useEffect(() => {
		if (isLoading) return;
		handleReset();
	}, [isLoading]);

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

	const handleSubmit = async () => {
		if (submiting) return;
		setSubmiting(true);

		await api.patch("/user/api-keys", {
			openai,
			gemini,
			anthropic,
			replicate
		}).catch(() => {
			setSubmiting(false);
		});

		await mutate();
		setSubmiting(false);
	};

	return (
		<>
			<div className="w-full max-w-2xl h-full mx-auto flex flex-col space-y-10">
				<div className="w-full flex flex-col border-l lg:border-none lg:grid grid-cols-3">
					<div className="lg:border-r flex flex-col pl-4 lg:pl-0 lg:items-end pr-5 pb-3 lg:pb-5 py-5 lg:text-right">
						<h1 className="text-lg text-foreground font-medium">OpenAI</h1>
						<p className="text-muted text-sm">{t("Description", { provider: "OpenAI" })}</p>
					</div>
					<div className="col-span-2 pt-0 lg:pt-5 py-5 lg:pl-5 pl-2 space-y-3">
						<Input label='Anahtar' value={openai} onChange={e => setOpenai(e.target.value)} />
					</div>
				</div>
				<div className="w-full flex flex-col border-l lg:border-none lg:grid grid-cols-3">
					<div className="lg:border-r flex flex-col pl-4 lg:pl-0 lg:items-end pr-5 pb-3 lg:pb-5 py-5 lg:text-right">
						<h1 className="text-lg text-foreground font-medium">Gemini</h1>
						<p className="text-muted text-sm">{t("Description", { provider: "Gemini" })}</p>
					</div>
					<div className="col-span-2 pt-0 lg:pt-5 py-5 lg:pl-5 pl-2 space-y-3">
						<Input label='Anahtar' value={gemini} onChange={e => setGemini(e.target.value)} />
					</div>
				</div>
				<div className="w-full flex flex-col border-l lg:border-none lg:grid grid-cols-3">
					<div className="lg:border-r flex flex-col pl-4 lg:pl-0 lg:items-end pr-5 pb-3 lg:pb-5 py-5 lg:text-right">
						<h1 className="text-lg text-foreground font-medium">Anthropic</h1>
						<p className="text-muted text-sm">{t("Description", { provider: "Claude" })}</p>
					</div>
					<div className="col-span-2 pt-0 lg:pt-5 py-5 lg:pl-5 pl-2 space-y-3">
						<Input label='Anahtar' value={anthropic} onChange={e => setAnthropic(e.target.value)} />
					</div>
				</div>
				<div className="w-full flex flex-col border-l lg:border-none lg:grid grid-cols-3">
					<div className="lg:border-r flex flex-col pl-4 lg:pl-0 lg:items-end pr-5 pb-3 lg:pb-5 py-5 lg:text-right">
						<h1 className="text-lg text-foreground font-medium">Replicate</h1>
						<p className="text-muted text-sm">{t("Description", { provider: "Replicate" })}</p>
					</div>
					<div className="col-span-2 pt-0 lg:pt-5 py-5 lg:pl-5 pl-2 space-y-3">
						<Input label='Anahtar' value={replicate} onChange={e => setReplicate(e.target.value)} />
					</div>
				</div>
			</div>
			<div className="flex justify-center items-center space-x-5 sticky bottom-0 py-3 bg-gradient-to-t from-primary via-primary/50">
				<div className="rounded-2xl h-11 px-5 backdrop-blur bg-primary/50 flex items-center justify-center">
					<Button onClick={handleReset} disabled={submiting} variant="link" className="text-muted">{t("Reset")}</Button>
				</div>
				<div className="rounded-2xl bg-primary">
					<Button onClick={handleSubmit} disabled={!submitable || submiting} isLoading={submiting}>{t("Save")}</Button>
				</div>
			</div>
		</>
	);
};