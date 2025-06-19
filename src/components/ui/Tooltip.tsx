import { cn } from "@colidy/ui-utils";
import { Tooltip as TooltipPrimitive } from "radix-ui";

export const Tooltip = ({
	content,
	children,
	...props
}: {
	content: React.ReactNode | string;
	children: React.ReactNode;
	[props: string]: any;
}) => {
	return (
		<TooltipPrimitive.Provider>
			<TooltipPrimitive.Root>
				<TooltipPrimitive.Trigger asChild>
					{children}
				</TooltipPrimitive.Trigger>
				<TooltipPrimitive.Portal>
					<TooltipPrimitive.Content
						className={cn("bg-foreground text-primary rounded-md shadow-sm px-2 z-50", [
							"animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out",
							"data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2",
							"data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50",
							"w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance"
						])}
						sideOffset={8}
						side="top"
						{...props}
					>
						{/* <TooltipPrimitive.Arrow className="fill-foreground" /> */}
						{typeof content === "string" ? (
							<span className="text-xs text-muted-foreground">
								{content}
							</span>
						) : content}
					</TooltipPrimitive.Content>
				</TooltipPrimitive.Portal>
			</TooltipPrimitive.Root>
		</TooltipPrimitive.Provider >
	)
}