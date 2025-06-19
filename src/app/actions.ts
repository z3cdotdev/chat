'use server'
import { cookies } from "next/headers";

export const pin = async (conversationId: string) => {
	const cookiesStore = await cookies();
	const pinned = cookiesStore.get('pinnedConversations')?.value || '';
	const pinnedIds = pinned ? pinned.split(',').map(id => id.trim()) : [];
	if (!pinnedIds.includes(conversationId)) {
		pinnedIds.push(conversationId);
		cookiesStore.set('pinnedConversations', pinnedIds.join(','));
	}
};

export const unpin = async (conversationId: string) => {
	const cookiesStore = await cookies();
	const pinned = cookiesStore.get('pinnedConversations')?.value || '';
	const pinnedIds = pinned ? pinned.split(',').map(id => id.trim()) : [];
	const index = pinnedIds.indexOf(conversationId);
	if (index > -1) {
		pinnedIds.splice(index, 1);
		cookiesStore.set('pinnedConversations', pinnedIds.join(','));
	}
};