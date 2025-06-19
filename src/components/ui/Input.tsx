import { cn } from "@colidy/ui-utils";
import { useEffect, useId, useMemo, useState } from "react";
import Ink from "react-ink";

function Input({
	className,
	label,
	onChange,
	startContent,
	endContent,
	disabled,
	type: initialType = "text",
	...props
}: {
	className?: string;
	label?: string;
	startContent?: React.ReactNode | ((props: { focus: boolean }) => React.ReactNode);
	endContent?: React.ReactNode | ((props: { focus: boolean }) => React.ReactNode);
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "className">) {
	const id = useId();
	const [type, setType] = useState(initialType);
	const [focus, setFocus] = useState(false);
	const [value, setValue] = useState(props.value || props.defaultValue || "");
	const [isFloating, setIsFloating] = useState(false);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setValue(e.target.value);
		onChange?.(e);
	};

	useEffect(() => {
		if ((value && (value as string).trim().length > 0) || focus) {
			setIsFloating(true);
		} else {
			setIsFloating(false);
		}
	}, [focus, value]);

	const renderContent = (content: React.ReactNode | ((props: { focus: boolean }) => React.ReactNode)) => {
		if (typeof content === "function") {
			return content({ focus });
		}
		return content;
	}

	const end = useMemo(() => {
		if (initialType === "password") {
			return <button type="button" onClick={() => setType(type === "password" ? "text" : "password")} className="relative cursor-pointer font-medium hover:bg-border active:bg-border-hover transition-all duration-200 text-sm rounded-md px-2 py-1">
				<Ink opacity={0.05} />
				{type === "password" ? "Göster" : "Gizle"}
			</button>
		} else if (endContent) return renderContent(endContent);
		return null;
	}, [endContent, type, renderContent, focus]);

	const start = useMemo(() => {
		if (startContent) return renderContent(startContent);
		return null;
	}, [startContent, renderContent, focus]);

	useEffect(() => {
		if (disabled) {
			setFocus(false);
		}
	}, [disabled]);

	return (
		<label
			htmlFor={id}
			className={cn([
				"relative w-full bg-input border rounded-2xl flex items-center",
				"transition-all duration-200 ease-in-out cursor-text",
				"h-14 overflow-hidden"
			], {
				"border-orange-500 bg-input ring-2 ring-orange-500 ring-offset-2 ring-offset-secondary": focus,
				"hover:border-border-hover hover:bg-tertiary": !focus && !disabled,
				"cursor-not-allowed opacity-50 pointer-events-none": disabled
			}, className)}
		>
			{start && <div className="pl-4 flex items-center justify-center">{start}</div>}

			<div className="flex-1 relative">
				{label && (
					<span
						className={cn([
							"absolute pointer-events-none transition-all duration-200 ease-in-out",
							"text-muted-foreground left-4"
						], {
							"top-2 text-xs font-medium": isFloating,
							"top-1/2 -translate-y-1/2 text-sm": !isFloating,
							"text-orange-500": focus && isFloating
						})}
					>
						{label}
					</span>
				)}

				<input
					type={type}
					id={id}
					className={cn([
						"w-full h-full bg-transparent outline-none text-sm text-foreground px-4",
						"transition-all duration-200 ease-in-out",
						label && "pt-6 pb-2"
					])}
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

			{end && <div className="pr-4 flex items-center justify-center">{end}</div>}
		</label>
	);
}

export { Input };
export default Input;