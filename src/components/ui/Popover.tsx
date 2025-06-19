import { RiArrowDownSLine, RiArrowUpSLine, RiCheckLine } from '@remixicon/react';
import { cn } from '@colidy/ui-utils';
import { ScrollArea, Popover } from "radix-ui";
import * as React from "react";

function PopoverComp({
	children,
	placeholder = "Select an option",
	...props
}: {
	children: React.ReactNode;
	placeholder?: string;
} & React.ComponentProps<typeof Popover.Root>) {
	return (
		<Popover.Root {...props}>
			{children}
		</Popover.Root>
	);
};

function PopoverTrigger(props: React.ComponentProps<typeof Popover.Trigger>) {
	return (
		<Popover.Trigger
			{...props}
		/>
	);
};

function PopoverContent({
	children,
	className,
	...props
}: {
	children: React.ReactNode;
	className?: string;
} & React.ComponentProps<typeof Popover.Content>) {
	return (
		<Popover.Portal>
			<Popover.Content
				className={cn("bg-popover border rounded-xl p-1 w-[var(--radix-select-trigger-width)] min-w-64 shadow-xl", [
					"data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
					"data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2",
					"data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
					"data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
					"data-[align=center]:data-[side=right]:origin-left",
					"data-[align=start]:data-[side=right]:origin-top-left",
					"data-[align=end]:data-[side=right]:origin-bottom-left",
					"data-[align=center]:data-[side=left]:origin-right",
					"data-[align=start]:data-[side=left]:origin-top-right",
					"data-[align=end]:data-[side=left]:origin-bottom-right",
					"data-[align=center]:data-[side=bottom]:origin-top",
					"data-[align=start]:data-[side=bottom]:origin-top-left",
					"data-[align=end]:data-[side=bottom]:origin-top-right",
					"data-[align=center]:data-[side=top]:origin-bottom",
					"data-[align=start]:data-[side=top]:origin-bottom-left",
					"data-[align=end]:data-[side=top]:origin-bottom-right"
				], className)}
				sideOffset={5}
				asChild
				{...props}
			>
				<ScrollArea.Root className="max-h-96 overflow-x-hidden">
					<ScrollArea.Viewport>
						{children}
					</ScrollArea.Viewport>
				</ScrollArea.Root>
			</Popover.Content>
		</Popover.Portal>
	);
};
PopoverComp.displayName = "ColidyUI-Popover";
PopoverTrigger.displayName = "ColidyUI-PopoverTrigger";
PopoverContent.displayName = "ColidyUI-PopoverContent";

PopoverComp.Trigger = PopoverTrigger;
PopoverComp.Content = PopoverContent;

export {
	PopoverComp as Popover
};