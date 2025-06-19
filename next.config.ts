import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
	reactStrictMode: false,
	devIndicators: false,
	redirects: async () => {
		return [
			{
				source: '/settings',
				destination: '/settings/account',
				permanent: true
			},
		]
	},
	rewrites: async () => {
		return [
			{
				source: '/storage/public/:dir/:path*',
				destination: process.env.VERCEL_BLOB_STORAGE_URL + '/:dir/:path*'
			},
		];
	},
	transpilePackages: ['@lobehub/icons'],
	experimental: {
		nodeMiddleware: true
	}
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
