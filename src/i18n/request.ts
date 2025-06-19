import Negotiator from 'negotiator';
import { getRequestConfig } from 'next-intl/server';
import { headers } from 'next/headers';

export default getRequestConfig(async () => {
	const avaiableLocales = ['en', 'tr'];
	const acceptLanguage = (await headers()).get('accept-language') || '';
	const n = new Negotiator({
		headers: {
			'accept-language': acceptLanguage
		}
	});

	const locale = n.language(avaiableLocales) || 'en';

	return {
		locale,
		messages: (await import(`@/i18n/messages/${locale}.json`)).default
	};
});