import { cn } from "@colidy/ui-utils";
import { useEffect, useId, useMemo, useState, useRef } from "react";

export default function Textarea({
	className,
	label,
	onChange,
	startContent,
	endContent,
	disabled,
	minRows = 3,
	maxRows = 8,
	disableAutosize = false,
	onHeightChange,
	...props
}: {
	className?: string;
	label?: string;
	startContent?: React.ReactNode | ((props: { focus: boolean }) => React.ReactNode);
	endContent?: React.ReactNode | ((props: { focus: boolean }) => React.ReactNode);
	minRows?: number;
	maxRows?: number;
	disableAutosize?: boolean;
	onHeightChange?: (height: number) => void;
} & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "className">) {
	const id = useId();
	const [focus, setFocus] = useState(false);
	const [value, setValue] = useState("");
	const [isFloating, setIsFloating] = useState(false);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setValue(e.target.value);
		onChange?.(e);

		// Auto-resize functionality
		if (!disableAutosize && textareaRef.current) {
			autoResize();
		}
	};

	const autoResize = () => {
		if (!textareaRef.current) return;

		const textarea = textareaRef.current;
		const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
		const paddingTop = parseInt(getComputedStyle(textarea).paddingTop);
		const paddingBottom = parseInt(getComputedStyle(textarea).paddingBottom);

		// Reset height to calculate scrollHeight properly
		textarea.style.height = 'auto';

		// Calculate min and max heights
		const minHeight = lineHeight * minRows + paddingTop + paddingBottom;
		const maxHeight = lineHeight * maxRows + paddingTop + paddingBottom;

		// Set new height within bounds
		const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
		textarea.style.height = `${newHeight}px`;

		// Call height change callback
		onHeightChange?.(newHeight);
	};

	useEffect(() => {
		if ((value && value.trim().length > 0) || focus) {
			setIsFloating(true);
		} else {
			setIsFloating(false);
		}
	}, [focus, value]);

	useEffect(() => {
		if (disabled) {
			setFocus(false);
		}
	}, [disabled]);

	// Initialize autosize on mount
	useEffect(() => {
		if (!disableAutosize) {
			autoResize();
		}
	}, [disableAutosize, minRows, maxRows]);

	const renderContent = (content: React.ReactNode | ((props: { focus: boolean }) => React.ReactNode)) => {
		if (typeof content === "function") {
			return content({ focus });
		}
		return content;
	};

	const start = useMemo(() => {
		if (startContent) return renderContent(startContent);
		return null;
	}, [startContent, focus]);

	const end = useMemo(() => {
		if (endContent) return renderContent(endContent);
		return null;
	}, [endContent, focus]);

	return (
		<label
			htmlFor={id}
			className={cn([
				"relative w-full bg-input border rounded-2xl flex",
				"transition-all duration-200 ease-in-out cursor-text",
				"min-h-14 overflow-hidden"
			], {
				"border-orange-500 bg-input ring-2 ring-orange-500 ring-offset-2 ring-offset-secondary": focus,
				"hover:border-border-hover hover:bg-tertiary": !focus && !disabled,
				"cursor-not-allowed opacity-50 pointer-events-none": disabled
			}, className)}
		>
			{start && (
				<div className="pl-4 flex items-start justify-center pt-6">
					{start}
				</div>
			)}

			<div className="flex-1 relative">
				{label && (
					<span
						className={cn([
							"absolute pointer-events-none transition-all duration-200 ease-in-out",
							"text-muted-foreground left-4"
						], {
							"top-2 text-xs font-medium": isFloating,
							"top-6 text-sm": !isFloating,
							"text-orange-500": focus && isFloating
						})}
					>
						{label}
					</span>
				)}

				<textarea
					ref={textareaRef}
					id={id}
					className={cn([
						"w-full bg-transparent outline-none text-sm text-foreground px-4 resize-none",
						"transition-all duration-200 ease-in-out",
						"leading-relaxed"
					], {
						"pt-6 pb-4": label,
						"py-4": !label,
						"overflow-hidden": !disableAutosize
					})}
					rows={disableAutosize ? minRows : undefined}
					style={{
						minHeight: disableAutosize ? undefined : `${minRows * 1.5 + 2}rem`,
						maxHeight: disableAutosize ? undefined : `${maxRows * 1.5 + 2}rem`
					}}
					onChange={handleChange}
					onFocus={(e) => {
						if (disabled) return;
						setFocus(true);
						props.onFocus?.(e);
					}}
					onBlur={(e) => {
						if (disabled) return;
						setFocus(false);
						props.onBlur?.(e);
					}}
					autoComplete="off"
					autoCorrect="on"
					{...props}
				/>
			</div>

			{end && (
				<div className="pr-4 flex items-start justify-center pt-6">
					{end}
				</div>
			)}
		</label>
	);
}
