"use client"

import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react"
import { cn } from "@colidy/ui-utils"

function DropdownMenu({
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
	return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

function DropdownMenuPortal({
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
	return (
		<DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
	)
}

function DropdownMenuTrigger({
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
	return (
		<DropdownMenuPrimitive.Trigger
			data-slot="dropdown-menu-trigger"
			{...props}
		/>
	)
}

function DropdownMenuContent({
	className,
	sideOffset = 4,
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
	return (
		<DropdownMenuPrimitive.Portal>
			<DropdownMenuPrimitive.Content
				data-slot="dropdown-menu-content"
				sideOffset={sideOffset}
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
				], className)}
				{...props}
			/>
		</DropdownMenuPrimitive.Portal>
	)
}

function DropdownMenuGroup({
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
	return (
		<DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
	)
}

function DropdownMenuItem({
	className,
	inset,
	variant = "default",
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
	inset?: boolean
	variant?: "default" | "destructive"
}) {
	return (
		<DropdownMenuPrimitive.Item
			data-slot="dropdown-menu-item"
			data-inset={inset}
			data-variant={variant}
			className={cn(
				"flex items-center text-muted hover:text-foreground relative px-3 py-2 hover:bg-popover-hover cursor-pointer rounded-lg justify-between space-x-2 text-sm transition-all !outline-none",
				className
			)}
			{...props}
		/>
	)
}

function DropdownMenuCheckboxItem({
	className,
	children,
	checked,
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
	return (
		<DropdownMenuPrimitive.CheckboxItem
			data-slot="dropdown-menu-checkbox-item"
			className={cn(
				"focus:bg-popover-hover focus:text-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
				className
			)}
			checked={checked}
			{...props}
		>
			<span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
				<DropdownMenuPrimitive.ItemIndicator>
					<CheckIcon className="size-4" />
				</DropdownMenuPrimitive.ItemIndicator>
			</span>
			{children}
		</DropdownMenuPrimitive.CheckboxItem>
	)
}

function DropdownMenuRadioGroup({
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
	return (
		<DropdownMenuPrimitive.RadioGroup
			data-slot="dropdown-menu-radio-group"
			{...props}
		/>
	)
}

function DropdownMenuRadioItem({
	className,
	children,
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
	return (
		<DropdownMenuPrimitive.RadioItem
			data-slot="dropdown-menu-radio-item"
			className={cn(
				"focus:bg-popover-hover focus:text-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
				className
			)}
			{...props}
		>
			<span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
				<DropdownMenuPrimitive.ItemIndicator>
					<CircleIcon className="size-2 fill-current" />
				</DropdownMenuPrimitive.ItemIndicator>
			</span>
			{children}
		</DropdownMenuPrimitive.RadioItem>
	)
}

function DropdownMenuLabel({
	className,
	inset,
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
	inset?: boolean
}) {
	return (
		<DropdownMenuPrimitive.Label
			data-slot="dropdown-menu-label"
			data-inset={inset}
			className={cn(
				"px-3 text-xs font-medium text-muted-foreground my-2 text-muted",
				className
			)}
			{...props}
		/>
	)
}

function DropdownMenuSeparator({
	className,
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
	return (
		<DropdownMenuPrimitive.Separator
			data-slot="dropdown-menu-separator"
			className={cn("bg-border -mx-1 my-1 h-px", className)}
			{...props}
		/>
	)
}

function DropdownMenuShortcut({
	className,
	...props
}: React.ComponentProps<"span">) {
	return (
		<span
			data-slot="dropdown-menu-shortcut"
			className={cn(
				"text-muted ml-auto text-xs tracking-widest bg-tertiary px-2 py-1 rounded",
				className
			)}
			{...props}
		/>
	)
}

function DropdownMenuSub({
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
	return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />
}

function DropdownMenuSubTrigger({
	className,
	inset,
	children,
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
	inset?: boolean
}) {
	return (
		<DropdownMenuPrimitive.SubTrigger
			data-slot="dropdown-menu-sub-trigger"
			data-inset={inset}
			className={cn(
				"flex items-center text-muted hover:text-foreground relative px-3 py-2 hover:bg-popover-hover cursor-pointer rounded-lg justify-between space-x-2 text-sm transition-all !outline-none",
				className
			)}
			{...props}
		>
			{children}
			<ChevronRightIcon className="ml-auto size-4" />
		</DropdownMenuPrimitive.SubTrigger>
	)
}

function DropdownMenuSubContent({
	className,
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
	return (
		<DropdownMenuPrimitive.SubContent
			data-slot="dropdown-menu-sub-content"
			className={cn(
				"bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg",
				className
			)}
			{...props}
		/>
	)
}

DropdownMenu.displayName = "ColidyUI-DropdownMenu"
DropdownMenuPortal.displayName = "ColidyUI-DropdownMenuPortal"
DropdownMenuTrigger.displayName = "ColidyUI-DropdownMenuTrigger"
DropdownMenuContent.displayName = "ColidyUI-DropdownMenuContent"
DropdownMenuGroup.displayName = "ColidyUI-DropdownMenuGroup"
DropdownMenuItem.displayName = "ColidyUI-DropdownMenuItem"
DropdownMenuCheckboxItem.displayName = "ColidyUI-DropdownMenuCheckboxItem"
DropdownMenuRadioGroup.displayName = "ColidyUI-DropdownMenuRadioGroup"
DropdownMenuRadioItem.displayName = "ColidyUI-DropdownMenuRadioItem"
DropdownMenuLabel.displayName = "ColidyUI-DropdownMenuLabel"
DropdownMenuSeparator.displayName = "ColidyUI-DropdownMenuSeparator"
DropdownMenuShortcut.displayName = "ColidyUI-DropdownMenuShortcut"
DropdownMenuSub.displayName = "ColidyUI-DropdownMenuSub"
DropdownMenuSubTrigger.displayName = "ColidyUI-DropdownMenuSubTrigger"
DropdownMenuSubContent.displayName = "ColidyUI-DropdownMenuSubContent"

export const Dropdown = Object.assign(DropdownMenu, {
	Portal: DropdownMenuPortal,
	Trigger: DropdownMenuTrigger,
	Content: DropdownMenuContent,
	Group: DropdownMenuGroup,
	Item: DropdownMenuItem,
	CheckboxItem: DropdownMenuCheckboxItem,
	RadioGroup: DropdownMenuRadioGroup,
	RadioItem: DropdownMenuRadioItem,
	Label: DropdownMenuLabel,
	Separator: DropdownMenuSeparator,
	Shortcut: DropdownMenuShortcut,
	Sub: DropdownMenuSub,
	SubTrigger: DropdownMenuSubTrigger,
	SubContent: DropdownMenuSubContent,
})