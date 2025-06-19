"use client";

import { useParams, usePathname } from 'next/navigation';
import { useHotkeys } from 'react-hotkeys-hook';
import { authClient } from '@/lib/authClient';
import { RiMenuLine } from '@remixicon/react';
import { useMemo, useState } from 'react';
import { Dropdown } from '@/ui/Dropdown';
import { Dialog } from '../ui/Dialog';
import { Button } from '@/ui/Button';
import { Avatar } from '@/ui/Avatar';
import Input from '../ui/Input';
import Link from 'next/link';

import { useMounted } from '@/hooks/use-mounted';
import { useSession } from "@/hooks/use-session";
import { useSidebarStore } from '@/stores/use-sidebar';
import { useChatDataStore } from '@/stores/use-chat-data';

import { useClientFunctions } from '@/hooks/use-client-functions';
import z3cConfig from '@/../z3c.config.json';
import { RotatingLines } from '../ui/Spinner';
import { AnimatePresence } from 'motion/react';
import { motion } from 'motion/react';
import { cn } from '@colidy/ui-utils';
import { useTranslations } from 'next-intl';

export default function Navbar({
	sub,
	hiddenMenu
}: {
	showChat?: boolean;
	rightContent?: React.ReactNode;
	leftContent?: React.ReactNode;
	sub?: string;
	hiddenMenu?: boolean;
}) {
	const pathname = usePathname();
	const params = useParams();
	const toggleSidebar = useSidebarStore((state) => state.toggleSidebar);
	const responseStore = useChatDataStore((state) => state.response);
	const t = useTranslations("Navbar");

	const shared_id = useMemo(() => {
		return responseStore?.is_shared || false;
	}, [responseStore]);

	const conversationId = params?.conversationId as string | undefined;
	const [shareId, setShareId] = useState<string | null>(shared_id ? z3cConfig.app_url + "/chats/" + shared_id || null : null);
	const [copied, setCopied] = useState(false);
	const {
		share: {
			handleShare,
			isSharing
		},
		unshare: {
			handleUnshare,
			isUnsharing
		}
	} = useClientFunctions();

	const title = useMemo(() => {
		if (pathname === '/chats/' + (params?.conversationId || '')) {
			const conversationTitle = responseStore?.title || t("NewChat");
			return conversationTitle;
		}

		return false;
	}, [pathname, responseStore, t]);

	return (
		<nav className={cn("sticky top-0 xl:flex rounded-b-2xl z-[20] flex justify-between items-center gap-2 bg-secondary backdrop-blur-sm xl:backdrop-blur-none xl:bg-transparent flex-shrink-0 !h-16 border-b xl:border-none px-3", {
			"lg:!px-9": title,
			"-mx-9 xl:mx-0 xl:px-0": !title
		})}>
			{/* <span className="fixed top-0 left-0 right-0 h-16 bg-primary lg:hidden -z-1" /> */}
			<div className="flex items-center gap-2">
				{!hiddenMenu && (
					<div className="lg:hidden w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
						<button onClick={toggleSidebar} className="!outline-none !ring-0 !border-0 !bg-transparent cursor-pointer select-none text-foreground">
							<RiMenuLine size={20} />
						</button>
					</div>
				)}
				<Link href="/">
					<h1 className="text-lg lg:hidden font-medium text-foreground">
						z3c<span className="font-normal opacity-50">.dev</span>
					</h1>
				</Link>
				{sub && <>
					<span className="text-sm lg:hidden text-muted select-none pointer-events-none">{'/'}</span>
					<h1 className="text-sm font-normal lg:hidden text-foreground">
						{sub}
					</h1>
				</>}
				<AnimatePresence>
					{title && (
						<motion.h1
							className="hidden lg:block text-lg font-medium text-foreground max-w-sm line-clamp-1"
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							style={{
								WebkitLineClamp: 1,
								WebkitBoxOrient: 'vertical',
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								display: '-webkit-box',
							}}
						>
							{title}
						</motion.h1>
					)}
				</AnimatePresence>
			</div>
			<div className="flex items-center gap-4">
				<div className="flex items-center gap-2">
					{!(!shared_id && pathname !== `/chats/${params?.conversationId}`) && (
						<Dialog>
							<Dialog.Trigger asChild>
								<Button className="rounded-full">
									{t("Share")}
								</Button>
							</Dialog.Trigger>
							<Dialog.Content
								titleChildren={t("ShareChat")}
								descriptionChildren={t("ShareChatDescription")}
							>
								<Input
									readOnly
									value={shareId || z3cConfig.app_url + "/chats/..."}
									endContent={
										shareId ? (
											<button
												onClick={() => {
													navigator.clipboard.writeText(shareId);
													setCopied(true);
													setTimeout(() => setCopied(false), 2000);
												}}
												className="text-orange-500 hover:underline cursor-pointer"
												disabled={!shareId}
											>
												{copied ? t("Copied") : t("Copy")}
											</button>
										) : null
									}
								/>

								<div className="flex items-center gap-2">
									{shareId && (
										<Button
											onClick={() => handleUnshare(conversationId as any, setShareId)}
											variant="destructive"
											className="w-full mt-4"
											disabled={isUnsharing}
										>
											{isUnsharing ? (
												<>
													<RotatingLines size={16} color="currentColor" />
													<span className="ml-2">{t("Stopping")}</span>
												</>
											) : (
												t("StopSharing")
											)}
										</Button>
									)}
									<Button
										onClick={() => handleShare(conversationId as any, setShareId)}
										className="w-full mt-4"
										disabled={isSharing}
									>
										{isSharing ? (
											<>
												<RotatingLines size={16} color="currentColor" />
												<span className="ml-2">{shareId ? t("Updating") : t("Sharing")}</span>
											</>
										) : (
											shareId ? t("Update") : t("Share")
										)}
									</Button>
								</div>
							</Dialog.Content>
						</Dialog>
					)}
					{/* 
					<div className="w-8 h-8 hidden lg:flex items-center justify-center">
						<span className="font-mono shadow-[inset_0_-2px_4px_var(--color-primary)] text-sm bg-secondary border border-b-4 rounded-md py-1 px-3">P</span>
					</div> */}
					<UserMenu />
				</div>
			</div>
		</nav>
	);
};

export const UserMenu = () => {
	const { data: session, isPending } = useSession();
	const mounted = useMounted();
	const t = useTranslations("Navbar");
	const isAuthenticated = mounted && (!!session && !isPending && session.user && !session.user.isAnonymous);
	const [open, setOpen] = useState(false);

	useHotkeys('p', () => setOpen(!open));

	if (!isAuthenticated) return (
		<Button href="/auth/signin" className="rounded-full">{t("SignIn")}</Button>
	);

	const handleLogout = async () => {
		await authClient.signOut();
	};

	return (
		<Dropdown open={open} onOpenChange={setOpen}>
			<Dropdown.Trigger asChild>
				<button className="!outline-none !ring-0 !border-0 !bg-transparent cursor-pointer select-none">
					<Avatar user={session.user as any} className="w-10 h-10 relative rounded-full overflow-hidden border-2 border-foreground border-dashed" />
				</button>
			</Dropdown.Trigger>
			<Dropdown.Content sideOffset={5} align="end">
				<Dropdown.Item className="p-0">
					<Link href="/settings" className='px-3 py-2 w-full'>
						{t("Settings")}
					</Link>
				</Dropdown.Item>
				<Dropdown.Item className="p-0">
					<Link href="/settings/apikeys" className='px-3 py-2 w-full'>
						{t("ApiKeys")}
					</Link>
				</Dropdown.Item>
				<Dropdown.Separator />
				<Dropdown.Item onClick={handleLogout}>
					{t("Logout")}
				</Dropdown.Item>
			</Dropdown.Content>
		</Dropdown>
	)
}