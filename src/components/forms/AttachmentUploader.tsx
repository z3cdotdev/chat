"use client";

import { useCallback, useEffect } from "react";
import { api } from "@/lib/api";
import { Tooltip } from "../ui/Tooltip";
import { Cancel01Icon } from "hugeicons-react";
import { RotatingLines } from "../ui/Spinner";
import { motion } from "framer-motion";
import { memo } from "react";
import { useAttachmentsStore } from "@/stores/use-attachments";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface AttachmentUploaderProps {
	uploadRef: React.RefObject<HTMLInputElement | null>;
}

export const AttachmentUploader = ({
	uploadRef,
}: AttachmentUploaderProps) => {
	const t = useTranslations("AttachmentUpload");
    
	const attachments = useAttachmentsStore(state => state.attachments);
	const addAttachment = useAttachmentsStore(state => state.addAttachment);
	const updateAttachment = useAttachmentsStore(state => state.updateAttachment);
	const removeAttachment = useAttachmentsStore(state => state.removeAttachment);

	const uploadToServer = async (attachment: any) => {
		try {
			const formData = new FormData();
			formData.append('file', attachment.file);
			formData.append('name', attachment.name);

			const response = await api.post('/upload?filename=' + attachment.name, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});

			if (response.data) {
				updateAttachment(attachment.id, {
					uploading: false,
					preview: response.data.url || attachment.preview
				});
				toast.success(t("Uploaded", { name: attachment.name }));
			}
		} catch (error) {
			console.error('Upload error:', error);
			updateAttachment(attachment.id, {
				uploading: false
			});
			toast.error(t("UploadError", { name: attachment.name }));
		}
	};

	const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
		e.preventDefault();
		try {
			const files = e.target.files;
			if (!files || files.length === 0) return;

			const fileArray = Array.from(files);

			// Validate file types and sizes
			const maxSize = 10 * 1024 * 1024; // 10MB
			const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'text/plain', 'application/pdf'];

			for (const file of fileArray) {
				if (file.size > maxSize) {
					toast.error(t("MaxSize", { file: file.name, size: String(maxSize / 1024 / 1024) }));
					continue;
				}

				if (!allowedTypes.includes(file.type)) {
					toast.error(t("UnsupportedType", { file: file.name }));
					continue;
				}

				const id = `${Date.now()}-${Math.random()}`;
				const newAttachment = {
					id,
					name: file.name,
					type: file.type,
					size: file.size,
					preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
					extension: file.name.split(".").pop() || '',
					uploading: true,
					file
				};
				addAttachment(newAttachment);

				// Upload to server
				uploadToServer(newAttachment);
			}

			if (uploadRef.current) {
				uploadRef.current.value = "";
			}
		} catch (error) {
			console.error("Error uploading files:", error);
			toast.error(t("Error"));
		}
	}, [addAttachment, uploadRef]);

	useEffect(() => {
		return () => {
			// Cleanup blob URLs
			attachments.forEach((attachment: any) => {
				if (attachment.preview?.startsWith('blob:')) {
					URL.revokeObjectURL(attachment.preview);
				}
			});
		};
	}, [attachments]);

	const handleRemoveAttachment = useCallback((id: string) => {
		const attachment = attachments.find(att => att.id === id);
		if (attachment?.preview?.startsWith('blob:')) {
			URL.revokeObjectURL(attachment.preview);
		}
		removeAttachment(id);
		toast.success(t("Removed"));
	}, [removeAttachment, attachments]);

	return (
		<>
			<input
				type="file"
				ref={uploadRef}
				className="hidden"
				multiple
				accept="image/*,.pdf,.txt"
				onChange={handleUpload}
			/>
		</>
	);
};

const formatBytes = (bytes: number) => {
	const units = ['B', 'KB', 'MB', 'GB', 'TB'];
	const index = Math.floor(Math.log(bytes) / Math.log(1024));
	return (bytes / Math.pow(1024, index)).toFixed(2) + ' ' + units[index];
};

export const AttachmentItem = memo(({
	attachment,
	onRemove
}: {
	attachment: any;
	onRemove: (id: string) => void;
}) => {
	const t = useTranslations("AttachmentUpload");
    
	const handleRemove = useCallback(() => {
		onRemove(attachment.id);
	}, [attachment.id, onRemove]);

	return (
		<Tooltip
			content={
				attachment.preview && attachment.preview.trim() ? (
					<img
						src={attachment.preview}
						alt={attachment.name || 'Preview'}
						loading="lazy"
						className="w-full h-full max-w-sm object-contain"
					/>
				) : (
					<div className="flex items-center justify-center p-4 text-muted-foreground">
						{t("NoPreview")}
					</div>
				)
			}
		>
			<motion.div
				className="flex items-center gap-2 border border-border bg-input rounded-xl p-2 pr-3 relative min-w-0 flex-shrink-0"
				initial={{ opacity: 0, scale: 0.8 }}
				animate={{ opacity: 1, scale: 1 }}
				exit={{ opacity: 0, scale: 0.8 }}
				transition={{ duration: 0.2 }}
			>
				<div className="relative w-10 h-10 flex-shrink-0 rounded-lg overflow-hidden">
					{attachment.preview && attachment.preview.trim() ? (
						<img
							src={attachment.preview}
							alt={attachment.name || 'Preview'}
							className="w-10 h-10 rounded-lg object-cover"
							onError={(e) => {
								(e.target as HTMLImageElement).style.display = 'none';
							}}
						/>
					) : (
						<div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center border">
							<span className="text-xs text-muted-foreground font-medium">
								{attachment.extension?.toUpperCase() || 'FILE'}
							</span>
						</div>
					)}
					{attachment.uploading && (
						<div className="absolute inset-0 bg-black/60 text-white flex justify-center items-center rounded-lg">
							<RotatingLines size={20} color="currentColor" />
						</div>
					)}
				</div>
				<div className="flex flex-col min-w-0 flex-1">
					<p className="text-sm text-foreground truncate font-medium max-w-[8rem] line-clamp-1">{attachment.name}</p>
					<p className="text-xs text-muted-foreground">{formatBytes(attachment.size)}</p>
				</div>
				<button
					className="text-muted-foreground hover:text-red-500 cursor-pointer p-1 rounded-lg hover:bg-red-500/10 transition-colors flex-shrink-0"
					onClick={handleRemove}
					type="button"
				>
					<Cancel01Icon className="w-4 h-4" />
				</button>
			</motion.div>
		</Tooltip>
	);
});

AttachmentItem.displayName = "AttachmentItem";