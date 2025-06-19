"use client";

import { Logo } from '@/components/brand/Logo';
import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { authClient } from '@/lib/authClient';
import { cn } from "@colidy/ui-utils";
import { RiDiscordFill, RiErrorWarningFill, RiMailLine } from '@remixicon/react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { useState } from 'react';

export default function Signin() {
	const [formData, setFormData] = useState({
		email: '',
		password: '',
		username: ''
	});

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		if (error) setError(null);
		setFormData(prev => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setLoading(true);

		const { data, error } = await authClient.signUp.email({
			email: formData.email,
			password: formData.password,
			username: formData.username,
			name: formData.username,
			displayUsername: formData.username,
			interests: '',
			tone: '',
			bio: '',
			pinned_agents: []
		});

		setLoading(false);

		if (error) {
			const errorMap = {
				"EMAIL_NOT_VERIFIED": "E-posta adresin doğrulanmamış.",
				"INVALID_CREDENTIALS": "Geçersiz e-posta veya şifre.",
				"USER_NOT_FOUND": "Kullanıcı bulunamadı.",
				"ACCOUNT_LOCKED": "Hesabın kilitlenmiş. Lütfen destek ile iletişime geç.",
				"TOO_MANY_REQUESTS": "Çok fazla istek yapıldı. Lütfen daha sonra tekrar deneyin.",
				"UNKNOWN_ERROR": "Bilinmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin."
			};

			setError(error.code ? ((errorMap as any)?.[error.code] || error.message) : error.message);
			return;
		};

		if (data) redirect('/');
	};
	return (
		<div className="grid grid-cols-3 h-screen w-full">
			<div className="w-full hidden lg:block h-full pr-px bg-gradient-to-br from-popover via-border to-popover">
				<div className="flex h-full w-full flex-col p-20 justify-center bg-secondary">
					<Link href="/" className="flex items-center gap-2 grayscale-100 select-none w-fit drag-none">
						<div className="shrink-0">
							<Logo size={36} />
						</div>
						<h1 className="text-2xl font-medium text-foreground">
							z3c<span className="font-normal opacity-50">.dev</span>
						</h1>
					</Link>
					<div className="flex items-center flex-1 w-full">
						<h1 className="text-4xl max-w-md font-semibold text-muted/40">Effortlessly <span className="text-muted">Smart</span>, Naturally <span className="text-muted">Intuitive</span></h1>
					</div>
				</div>
			</div>
			<div className="lg:max-w-md mx-auto col-span-3 lg:col-span-2 h-full w-full flex flex-col  justify-center text-center items-center">
				<form className="w-full space-y-5" onSubmit={handleSubmit}>
					<h1 className="text-2xl text-foreground font-bold">
						Bir Z3C Hesabı Oluştur
					</h1>
					<div className="flex flex-col gap-2">
						{error && (
							<motion.div
								initial={{ opacity: 0, y: -20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -20 }}
								className="bg-red-400/10 text-red-400 py-2 px-4 rounded-full text-left text-sm mb-2 flex items-center justify-start"
							>
								<RiErrorWarningFill className="inline-block mr-2 w-4 h-4" />
								{error}
							</motion.div>
						)}
						<Input
							value={formData.email}
							onChange={handleInputChange}
							name="email"
							label="E-posta"
							type="email"
							disabled={loading}
						/>
						<Input
							value={formData.username}
							onChange={handleInputChange}
							name="username"
							label="Kullanıcı Adı"
							type="text"
							disabled={loading}
						/>
						<Input
							value={formData.password}
							onChange={handleInputChange}
							name="password"
							label="Şifre"
							type="password"
							disabled={loading}
						/>
					</div>

					<Button className="block w-full" disabled={((!formData.email || !formData.password || !formData.username) || error !== null) || loading} isLoading={loading} type="submit">
						Hesap Oluştur
					</Button>
				</form>

				<div className="mt-5 text-sm text-muted-foreground text-center">
					Zaten bir hesabın var mı? <Button variant="link" href="/auth/signin">Oturum aç.</Button>
				</div>
			</div>
		</div>
	);
};