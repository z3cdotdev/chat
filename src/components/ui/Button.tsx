import React, { AnchorHTMLAttributes, ButtonHTMLAttributes, forwardRef, InputHTMLAttributes, LabelHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import Link, { LinkProps } from 'next/link';
import Ink from 'react-ink';
import { cn } from '@colidy/ui-utils';
import { Line } from '@/ui/Spinner';

const buttonVariants = cva(
	[
		"select-none drag-none cursor-pointer inline-flex items-center justify-center rounded-2xl transition-all duration-300",
		"font-normal transition-all focus-visible:ring-2 disabled:opacity-50 disabled:pointer-events-none",
		"outline-none ring-transparent"
	],
	{
		variants: {
			variant: {
				default: "bg-foreground text-primary",
				link: "bg-transparent text-orange-500 hover:underline underline-offset-3 !px-2 !py-0.5 !h-fit",
				destructive: "bg-red-400/10 text-red-400 hover:bg-red-400/20",
			},
			size: {
				default: "h-11 px-6 py-3 text-sm",
				icon: "h-9 w-9"
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	}
);

// Button özelliklerini belirten interface
export interface ButtonProps
	extends ButtonHTMLAttributes<HTMLButtonElement>,
	VariantProps<typeof buttonVariants> {
	isLoading?: boolean;
	startIcon?: React.ReactNode;
	href?: string;
	linkProps?: Omit<LinkProps, 'href'>;
	target?: "_blank" | "_self";
	as?: React.ElementType; // 'button' veya 'a' gibi farklı element tipleri için
};

const Button = forwardRef<HTMLElement, ButtonProps>(
	({ as = 'button', className, href, variant = "default", size = "default", isLoading = false, children, startIcon, linkProps, ...props }, ref) => {
		const Comp = href ? Link : as;
		const compProps = href
			? { ...linkProps, href, ...props }
			: props;

		return (
			<Comp
				className={cn(
					"relative overflow-hidden group",
					buttonVariants({ variant, size }),
					isLoading && "relative transition-none pointer-events-none",
					className
				)}
				ref={ref as any}
				disabled={!href && (isLoading || props.disabled)}
				{...compProps as any}
			>
				<Ink opacity={0.2} />
				{/* {variant === "default" && (
					<>
						<span className="absolute bottom-0 right-0 w-8 h-20 -mb-8 -mr-5 transition-all duration-300 ease-out transform rotate-45 translate-x-1 bg-white opacity-10 group-hover:translate-x-0"></span>
						<span className="absolute top-0 left-0 w-20 h-8 -mt-1 -ml-12 transition-all duration-300 ease-out transform -rotate-45 -translate-x-1 bg-white opacity-10 group-hover:translate-x-0"></span>
					</>
				)} */}

				{isLoading && (
					<span className="absolute inset-0 flex items-center justify-center">
						<Line size={20} color="currentColor" />
					</span>
				)}

				{/* Ana içerik */}
				<span className={cn("flex items-center justify-center gap-2", {
					"opacity-0": isLoading,
					"opacity-100": !isLoading,
					"pointer-events-none": isLoading,
				})}>
					{startIcon && startIcon}
					{children}
				</span>
			</Comp>
		);
	}
);

Button.displayName = "Button";

export { Button, buttonVariants };