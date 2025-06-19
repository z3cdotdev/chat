import { toast } from "sonner";
import { api } from "@/lib/api";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMessages } from "@/hooks/use-messages";
import z3cConfig from "@/../z3c.config.json";

export const useClientFunctions = () => {
	const router = useRouter();
	const [isForking, setIsForking] = useState(false);
	const [isSharing, setIsSharing] = useState(false);
	const [isUnsharing, setIsUnsharing] = useState(false);
	const [isVoting, setIsVoting] = useState<null | 'up' | 'down'>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const { handleVoteFunction } = useMessages();

	const deleteConversationClient = async (conversationId: string, callback?: () => void) => {
		if (isDeleting) return;
		setIsDeleting(true);

		const response = await api.delete(`/conversation/${conversationId}/delete`)
			.then(res => res.data)
			.catch(error => ({ error: true, message: error?.response?.data?.message || error.message || 'Sohbet silinirken bir hata oluştu' }))
			.finally(() => setIsDeleting(false));

		if (response.error) {
			toast.error(response.message);
			return;
		}

		if (callback) callback();
	};

	const handleFork = async (conversationId: string, actionKey: string, actionBy?: 'object_id' | 'index') => {
		const messageId = actionKey;
		if (!messageId || isForking) return;
		setIsForking(true);

		toast.promise(
			api.post("/conversation/" + conversationId + "/fork", {
				messageId: messageId,
				findBy: actionBy || 'object_id'
			}),
			{
				loading: 'Forking conversation...',
				success: (res) => {
					setIsForking(false);
					router.push(res.data.data.redirect || `/chats/${res.data.data.conversationId}`);
					return 'Conversation forked successfully!';
				},
				error: (error) => {
					setIsForking(false);
					return error?.response?.data?.message || error.message || 'Failed to fork the conversation';
				},
			}
		);
	};

	const handleShare = async (conversationId: string, setShareId: (value: string | null) => void) => {
		if (!conversationId || isSharing) return;
		setIsSharing(true);

		toast.promise(
			api.post("/conversation/" + conversationId + "/share"),
			{
				loading: 'Sharing conversation...',
				success: (res) => {
					setIsSharing(false);
					setShareId(z3cConfig.app_url + "/chats/" + res.data.data?._id || null);
					return 'Share updated successfully!';
				},
				error: (error) => {
					setIsSharing(false);
					return error?.response?.data?.message || error.message || 'Failed to share the conversation';
				},
			}
		);
	};

	const handleUnshare = async (conversationId: string, setShareId: (value: string | null) => void) => {
		if (!conversationId || isUnsharing) return;
		setIsUnsharing(true);

		toast.promise(
			api.post("/conversation/" + conversationId + "/unshare"),
			{
				loading: 'Unsharing conversation...',
				success: (res) => {
					setIsUnsharing(false);
					setShareId(null);
					return 'Conversation unshared successfully!';
				},
				error: (error) => {
					setIsUnsharing(false);
					return error?.response?.data?.message || error.message || 'Failed to unshare the conversation';
				},
			}
		);
	};
	const handleVote = async (conversationId: string, messageId: string, direction: 'up' | 'down', messageIndex: number, actionBy: 'object_id' | 'index') => {
		if (!messageId && messageIndex === undefined) return;
		if (isVoting) return;

		setIsVoting(direction);

		toast.promise(
			api.post("/conversation/" + conversationId + "/vote", {
				vote: direction,
				messageId: messageId,
				findBy: actionBy
			}),
			{
				loading: `${direction === 'up' ? 'Upvoting' : 'Downvoting'} message...`,
				success: (response) => {
					setIsVoting(null);
					handleVoteFunction?.(messageIndex as number, response.data.data.vote);
					return `Message ${direction === 'up' ? 'upvoted' : 'downvoted'} successfully!`;
				},
				error: (error) => {
					setIsVoting(null);
					return error?.response?.data?.message || error.message || 'Failed to vote on the message';
				},
			}
		);
	};

	return {
		deleteConversation: {
			deleteConversation: deleteConversationClient,
			isDeleting
		},
		fork: {
			handleFork,
			isForking
		},
		share: {
			handleShare,
			isSharing
		},
		unshare: {
			handleUnshare,
			isUnsharing
		},
		vote: {
			handleVote,
			isVoting
		}
	}
};
