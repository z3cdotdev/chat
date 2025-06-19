import "@/app/globals.css";

import { Z3Provider } from "@/contexts/Z3Provider";
import { NextIntlClientProvider } from 'next-intl';
import { ThemeProvider } from 'next-themes';
import { getLocale } from 'next-intl/server';
import { cookies } from 'next/headers';
import { initZ3 } from "@/lib/init-z3";
import type { Metadata } from "next";
import Layout from '@/layout/Layout';

import { Inter, Roboto, Montserrat, Quicksand, Pixelify_Sans, JetBrains_Mono, Geist_Mono, Roboto_Mono, Source_Code_Pro } from 'next/font/google';
import { AuthProvider } from "@/contexts/AuthProvider";
import { SessionData } from "@/middleware/withAuth";
import localFont from 'next/font/local';
import { auth } from "@/lib/auth";
import { Toaster } from "sonner";

export const metadata: Metadata = {
	title: {
		default: "Z3C - Your AI Wrapper",
		template: "%s | Z3C - Your AI Wrapper",
	},
	description: "Z3C - Your AI Wrapper",
	openGraph: {
		title: "Z3C - Your AI Wrapper",
		description: "Z3C - Your AI Wrapper",
		url: "https://chat.z3c.dev",
		siteName: "Z3C - Your AI Wrapper",
		type: "website"
	},
	icons: {
		icon: "/favicon.ico",
		shortcut: "/favicon.ico",
	},
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#ffffff" },
		{ media: "(prefers-color-scheme: dark)", color: "#000000" }
	],
	metadataBase: new URL("https://chat.z3c.dev"),
	robots: {
		index: true,
		follow: true,
	},
	keywords: ["AI", "Chatbot", "Z3C", "Wrapper", "OpenAI", "LLM", "Language Model", "Chat"],
	twitter: {
		card: "summary_large_image",
		title: "Z3C - Your AI Wrapper",
		description: "Z3C - Your AI Wrapper",
		siteId: "@z3cdotdev",
		creator: "@z3cdotdev",
	}
};

const lufga = localFont({ src: '../../public/fonts/LufgaRegular.ttf', variable: '--font-main' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const roboto = Roboto({ subsets: ['latin'], variable: '--font-roboto' });
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat' });
const quicksand = Quicksand({ subsets: ['latin'], variable: '--font-quicksand' });

const jbmono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });
const robotoMono = Roboto_Mono({ subsets: ['latin'], variable: '--font-roboto-mono' });
const sourceCodePro = Source_Code_Pro({ subsets: ['latin'], variable: '--font-source-code-pro' });

const mainFonts = { lufga, inter, roboto, montserrat, quicksand, jbmono, geistMono, robotoMono, sourceCodePro };
const pixelTheme = Pixelify_Sans({ subsets: ['latin'], variable: '--font-pixel' });

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const cookieList = await cookies();
	const locale = await getLocale();
	const init = await initZ3(cookieList.toString());

	const session = await auth.api.getSession({
		headers: {
			'Cookie': cookieList.toString()
		} as any
	}).catch(() => null);

	return (
		<html lang={locale} suppressHydrationWarning>
			<body className={`${Object.values(mainFonts).map(f => f.variable).join(' ')} ${pixelTheme.variable} antialiased overflow-x-hidden`}>
				<AuthProvider initialSession={JSON.parse(JSON.stringify(session)) as SessionData | null}>
					<Z3Provider z3={init}>
						<ThemeProvider themes={["light", "dark", "pixel"]} attribute={"class"} defaultTheme="system" enableSystem>
							<NextIntlClientProvider>
								<Toaster />
								<Layout>
									{children}
								</Layout>
							</NextIntlClientProvider>
						</ThemeProvider>
					</Z3Provider>
				</AuthProvider>
			</body>
		</html>
	);
}
