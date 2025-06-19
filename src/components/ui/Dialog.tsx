import { cn } from "@colidy/ui-utils";
import { Cancel01Icon } from "hugeicons-react";
import { Dialog as DialogPrimitive } from "radix-ui";

const DialogPrimitiveRoot = DialogPrimitive.Root;

export const Trigger = (props: React.ComponentProps<typeof DialogPrimitive.Trigger>) => (
	<DialogPrimitive.Trigger {...props} />
);

const Content = ({
	children,
	className,
	titleChildren,
	descriptionChildren,
	hiddenHeader,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
	children: React.ReactNode;
	className?: string;
	titleChildren?: React.ReactNode | string;
	descriptionChildren?: React.ReactNode | string;
	hiddenHeader?: boolean;
}) => (
	<DialogPrimitive.Portal>
		<DialogPrimitive.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50" />
		<DialogPrimitive.Content className={cn([
			"bg-primary p-6",
			"data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
			"fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-2xl duration-200 sm:max-w-lg"
		])}>
			{hiddenHeader ? (
				<>
					<DialogPrimitive.Title />
					<DialogPrimitive.Description />
				</>
			) : (
				<>
					<DialogPrimitive.Title className="m-0 text-[17px] font-medium text-foreground">
						{titleChildren}
					</DialogPrimitive.Title>
					<DialogPrimitive.Description className="mb-5 text-[15px] leading-normal text-muted">
						{descriptionChildren}
					</DialogPrimitive.Description>
				</>
			)}
			<div className={cn("flex flex-col gap-4", className)} {...props}>
				{children}
			</div>
			<DialogPrimitive.Close asChild>
				<button
					className="absolute right-6 top-6 inline-flex size-[25px] appearance-none items-center justify-center rounded-full text-muted bg-gray3 hover:bg-secondary focus:shadow-[0_0_0_2px] focus:shadow-orange-500 focus:outline-none transition-all duration-200"
					aria-label="Close"
				>
					<Cancel01Icon size={12} />
				</button>
			</DialogPrimitive.Close>
		</DialogPrimitive.Content>
	</DialogPrimitive.Portal>
);

const DialogClose = DialogPrimitive.Close;

export const Dialog = Object.assign(DialogPrimitiveRoot, {
	Trigger,
	Content,
	Close: DialogClose,
});