"use client";

import { api } from "@/lib/api";
import useSWR from "swr";

export const useSWRApi = (url: string, fetchOptions: any = {}, swrOptions: any = {}) => {
	const fetcher = (url: string) => api(url, fetchOptions)
		.then(res => res.data)
		.catch(() => null);

	return useSWR(url, fetcher, swrOptions);
}