'use client';

import { RiArrowLeftLine, RiUser3Line, RiBrushLine, RiKeyLine, RiBarChartLine, RiCodeLine, RiChatSmileAiLine } from '@remixicon/react';
import { useParams, usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { useSession } from "@/hooks/use-session";
import { useTranslations } from "next-intl";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@colidy/ui-utils';
import { Logo } from '@/brand/Logo';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
	const { data: session, isPending, refetch } = useSession();
	const [mount, setMount] = useState(false);
	const [load, setLoad] = useState(false);

	const t = useTranslations("SettingsPage");
	const router = useRouter();

	const { category } = useParams() || { category: 'account' };
	const pathname = usePathname();

	const searchParams = useSearchParams();
	const a = searchParams.get('a');

	useEffect(() => {
		setMount(true);
	}, []);

	useEffect(() => {
		if (isPending) return;

		if (!session || session?.user?.isAnonymous) {
			router.push('/auth/signin');
		} else {
			setLoad(true);
		}
	}, [isPending]);

	const isLoading = !load && (isPending || !session || session?.user?.isAnonymous);

	if (isLoading) return (
		<div className="flex h-screen w-full">
			<motion.div
				className="bg-primary sticky top-0 shrink-0 group h-screen hidden lg:flex flex-col justify-between p-6 border-r transition-all duration-300 ease-in-out"
				initial={{ width: 85 }}
			>
				<div className="w-full h-full space-y-10">
					<div className="flex w-full grayscale-100">
						<Logo size={36} />
					</div>
				</div>
			</motion.div>
			<div className="flex-1 w-full h-full flex items-center justify-center">
				<div className="w-8 h-8 border border-muted rounded-full">
					<div className="w-full h-full animate-spin relative flex justify-center">
						<span className="w-2 h-2 bg-muted block rounded-full -translate-y-1/2" />
					</div>
				</div>
			</div>
		</div>
	);

	const isActive = (href: string) => {
		return pathname === href;
	}

	const items = [
		{
			href: '/settings/account',
			title: t('Categories.Account.Title'),
			description: t('Categories.Account.Description'),
			icon: RiUser3Line
		},
		{
			href: '/settings/customization',
			title: t('Categories.Customization.Title'),
			description: t('Categories.Customization.Description'),
			icon: RiBrushLine
		},
		{
			href: '/settings/api-keys',
			title: t('Categories.ApiKeys.Title'),
			description: t('Categories.ApiKeys.Description'),
			icon: RiKeyLine
		},
		{
			href: '/settings/models',
			title: t('Categories.Models.Title'),
			description: t('Categories.Models.Description'),
			icon: RiChatSmileAiLine
		},
		{
			href: '/settings/usage',
			title: t('Categories.Usage.Title'),
			description: t('Categories.Usage.Description'),
			icon: RiBarChartLine
		}
	]

	const credits = {
		href: '/settings/credits',
		title: t('Categories.Devs.Title'),
		description: t('Categories.Devs.Description'),
		icon: RiCodeLine
	}

	return (
		<div className="flex">
			<motion.div
				className={cn("bg-primary hidden sticky top-0 shrink-0 group h-screen lg:flex flex-col justify-between p-6 border-r transition-all duration-300 ease-in-out", {
					'bg-secondary': a,
				})}
				initial={a ? { width: '24rem' } : { width: 85 }}
				animate={{ width: '24rem', backgroundColor: 'var(--color-secondary)' }}
			>
				<div className="w-full h-full flex flex-col space-y-10">
					<div className="flex w-full">
						<AnimatePresence mode="wait">
							{(!mount && !a) ? (
								<motion.div
									key={"logo"}
									className="grayscale-100"
									exit={{ opacity: 0, scale: 1, y: -20 }}
									animate={{ opacity: 1, scale: 1, y: 0 }}
								>
									<Logo size={36} />
								</motion.div>
							) : (
								<motion.div
									key={"arrow"}
									initial={a ? {} : { opacity: 0, scale: 1, y: 20 }}
									animate={{ opacity: 1, scale: 1, y: 0 }}
								>
									<Link href="/" className="text-muted cursor-pointer flex items-center space-x-2">
										<RiArrowLeftLine />
									</Link>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
					<div className="space-y-2">
						<motion.h1
							initial={a ? {} : { opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.5 }}
							className="text-2xl text-foreground"
						>
							{t('Title')}
						</motion.h1>
						<motion.p
							initial={a ? {} : { opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.7 }}
							className="text-muted max-w-64"
						>
							{t('Description')}
						</motion.p>
					</div>
					<div className="space-y-3 flex-1">
						{items.map((item, index) => {
							const IconComp = item.icon;
							return (
								<motion.div
									key={index}
									initial={a ? {} : { opacity: 0, scale: 0.95 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ delay: 0.1 * (index + 1) + 0.7 }}
									className={cn(item.icon || 'from-muted/20 to-muted/20', "rounded-2xl bg-gradient-to-br via-border p-px cursor-pointer")}
								>
									<Link href={item.href} className={cn("bg-secondary rounded-2xl transition-colors p-4 flex items-center space-x-4", {
										'bg-foreground': isActive(item.href),
										'hover:bg-primary/50': !isActive(item.href),
									})}>
										<div className={"relative " + (isActive(item.href) ? 'text-primary/60' : 'text-foreground/60')}>
											{isActive(item.href) && <span className="absolute inset-0 bg-gradient-to-tl transition-all via-transparent" />}
											<IconComp size={48} />
										</div>
										<div className="space-y-1">
											<h1 className={(isActive(item.href) ? 'text-primary' : 'text-foreground') + " leading-none text-lg"}>{item.title}</h1>
											<p className={(isActive(item.href) ? 'text-primary/60' : 'text-foreground/60') + " leading-none"}>{item.description}</p>
										</div>
									</Link>
								</motion.div>
							)
						})}
					</div>
					<motion.div
						initial={a ? {} : { opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ delay: 0.1 }}
						className="rounded-2xl bg-gradient-to-br via-border p-px cursor-pointer from-muted/20 to-muted/20"
					>
						<Link href={credits.href} className={cn("bg-secondary rounded-2xl transition-colors p-4 flex items-center space-x-4", {
							'bg-foreground': isActive(credits.href),
							'hover:bg-primary/50': !isActive(credits.href),
						})}>
							<div className={"relative " + (isActive(credits.href) ? 'text-primary/60' : 'text-foreground/60')}>
								{!isActive(credits.href) && <span className="absolute inset-0 bg-gradient-to-tl transition-all from-secondary via-transparent" />}
								<RiCodeLine size={48} />
							</div>
							<div className="space-y-1">
								<h1 className={(isActive(credits.href) ? 'text-primary' : 'text-foreground') + " leading-none text-lg"}>{credits.title}</h1>
								<p className={(isActive(credits.href) ? 'text-primary/60' : 'text-foreground/60') + " leading-none"}>{credits.description}</p>
							</div>
						</Link>
					</motion.div>
				</div>
			</motion.div >
			<div className="w-full flex-1 h-full min-h-screen flex flex-col">
				<div className="lg:hidden flex flex-col px-9 mb-6">
					<Navbar sub={t("Title")} hiddenMenu />
				</div>
				<div className="lg:hidden flex items-center gap-2 px-3 w-screen overflow-x-auto flex-wrap">
					{items.map((item, index) => {
						const IconComp = item.icon;
						return (
							<motion.div
								key={index}
								initial={a ? {} : { opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ delay: 0.1 * (index + 1) + 0.7 }}
								className={cn(item.icon || 'from-muted/20 to-muted/20', "rounded-2xl bg-gradient-to-br via-border p-px cursor-pointer")}
							>
								<Link href={item.href} className={cn("bg-secondary rounded-2xl transition-colors p-4 flex items-center space-x-4", {
									'bg-foreground': isActive(item.href),
									'hover:bg-primary/50': !isActive(item.href),
								})}>
									<div className={"relative " + (isActive(item.href) ? 'text-primary/60' : 'text-foreground/60')}>
										{!isActive(item.href) && <span className="absolute inset-0 bg-gradient-to-tl transition-all from-secondary via-transparent" />}
										<IconComp size={20} />
									</div>
									<div className="space-y-1">
										<h1 className={(isActive(item.href) ? 'text-primary' : 'text-foreground') + " break-keep leading-none text-lg"}>{item.title}</h1>
									</div>
								</Link>
							</motion.div>
						)
					})}
				</div>
				<div className="flex-1 flex flex-col justify-between px-2 lg:px-5 py-5 lg:py-20 space-y-10">
					{children}
				</div>
			</div>
		</div>
	);
};