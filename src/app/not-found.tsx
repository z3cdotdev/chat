"use client";

import Link from "next/link";

export default function NotFound() {
	return (
		<div className="text-center h-screen flex flex-col items-center justify-center -mt-24">
			<p className="text-base font-semibold text-colored">404</p>
			<h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl">
				Page not found
			</h1>
			<p className="mt-6 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">
				Sorry, we couldn’t find the page you’re looking for.
			</p>
			<div className="mt-10 flex items-center justify-center gap-x-6">
				<Link href="/" className="bg-secondary text-foreground hover:bg-accent px-4 py-2 rounded-2xl transition-all duration-300 cursor-pointer">
					Go to homepage
				</Link>
			</div>
		</div>
	);
}