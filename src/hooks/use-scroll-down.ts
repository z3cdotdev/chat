import { useState } from 'react';
import { useBottomScrollListener } from 'react-bottom-scroll-listener';

export function useScrollDown() {
	const [isNeedScroll, setIsNeedScroll] = useState(false);
	const [autoScroll, setAutoScroll] = useState(true);

	const scrollToBottom = () => {
		if (autoScroll) {
			window.scrollTo({
				top: document.documentElement.scrollHeight,
				behavior: 'smooth'
			});
		} else {
			setIsNeedScroll(true);
		}
	};

	useBottomScrollListener(() => {
		setAutoScroll(true);
		setIsNeedScroll(false);
	}, {
		offset: 100,
		debounce: 0,
		triggerOnNoScroll: true
	})

	return { isNeedScroll, autoScroll, scrollToBottom };
}