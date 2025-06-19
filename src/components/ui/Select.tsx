import { RiArrowDownSLine, RiArrowUpSLine, RiCheckLine } from '@remixicon/react';
import { cn } from '@colidy/ui-utils';
import { ScrollArea, Select } from "radix-ui";
import * as React from "react";

function SelectComp({
	children,
	placeholder = "Select an option",
	triggerProps = {},
	...props
}: {
	children: React.ReactNode;
	placeholder?: string;
	triggerProps?: React.ComponentProps<typeof Select.Trigger>;
} & React.ComponentProps<typeof Select.Root>) {
	const SelectTriggerComponent = React.Children.toArray(children).find(
		(child: any) => React.isValidElement(child) && child.type === SelectTrigger
	) as React.ReactElement | null;

	const ContentWithoutTrigger = React.Children.toArray(children).filter(
		(child: any) => !React.isValidElement(child) || child.type !== SelectTrigger
	);

	return (
		<Select.Root {...props}>
			{SelectTriggerComponent ? SelectTriggerComponent : (
				<Select.Trigger {...triggerProps} className={cn("cursor-pointer hover:bg-secondary transition-all bg-input border h-14 px-4 text-sm min-w-48 justify-between rounded-2xl outline-none flex items-center space-x-2", triggerProps.className || '')}>
					<Select.Value placeholder={placeholder} />
					<Select.Icon className="text-muted data-[state=open]:rotate-180 transition-transform ml-auto">
						<RiArrowDownSLine />
					</Select.Icon>
				</Select.Trigger>
			)}
			<Select.Portal>
				<Select.Content
					className={cn("bg-popover border rounded-xl p-1 w-[var(--radix-select-trigger-width)] min-w-64 shadow-xl z-50", [

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
					])}
					position="popper"
					sideOffset={5}
					asChild
				>
					<ScrollArea.Root className="max-h-96 overflow-x-hidden">
						<Select.Viewport className="space-y-3">
							<ScrollArea.Viewport>
								{ContentWithoutTrigger}
							</ScrollArea.Viewport>
						</Select.Viewport>
					</ScrollArea.Root>
				</Select.Content>
			</Select.Portal>
		</Select.Root>
	);
};

const SelectItem = React.forwardRef(
	({ children, className, ...props }: any, forwardedRef) => {
		return (
			<Select.Item
				className={cn("flex items-center text-muted hover:text-foreground relative px-3 py-2 hover:bg-popover-hover cursor-pointer rounded-lg justify-between space-x-2 text-sm transition-all !outline-none", className || '')}
				{...props}
				ref={forwardedRef}
			>
				<Select.ItemText className="flex-1">{children}</Select.ItemText>
				<Select.ItemIndicator className="text-foreground">
					<RiCheckLine className="w-4 h-4" />
				</Select.ItemIndicator>
			</Select.Item>
		);
	},
);

const SelectGroup = React.forwardRef(
	({ children, className, label, ...props }: any, forwardedRef) => {
		return (
			<Select.Group className={cn("space-y-1", className || '')} {...props} ref={forwardedRef}>
				<Select.Label className="px-3 text-xs font-medium text-muted-foreground mt-2 text-muted">
					{label}
				</Select.Label>
				{children}
			</Select.Group>
		);
	}
);

const SelectTrigger = Select.Trigger;

SelectComp.displayName = "ColidyUI-Select";
SelectItem.displayName = "ColidyUI-SelectItem";
SelectGroup.displayName = "ColidyUI-SelectGroup";

SelectComp.Trigger = SelectTrigger;
SelectComp.Item = SelectItem;
SelectComp.Group = SelectGroup;

export {
	SelectComp as Select
};