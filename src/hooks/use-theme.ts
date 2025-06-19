"use client";

import { useTheme as useNextTheme } from 'next-themes';
import type { useThemeSchema } from "@/lib/definitions";
import { useMounted } from "@/hooks/use-mounted";

export const useTheme = (): useThemeSchema => {
	const mounted = useMounted();
	const { theme, setTheme } = useNextTheme();

	return {
		theme: mounted ? (theme ?? 'light') : 'light',
		setTheme
	};
};