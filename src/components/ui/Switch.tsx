'use client';

import { cn } from '@colidy/ui-utils';
import { Switch as SwitchPrimitive } from 'radix-ui';
import { forwardRef } from 'react';

export const Switch = forwardRef<
	HTMLLabelElement,
	{
		size?: 'sm' | 'md' | 'lg';
	} & React.ComponentProps<typeof SwitchPrimitive.Root>
>(({ size = 'md', ...props }, ref) => {
	const sizeStyles = {
		md: {
			root: 'w-[42px] h-[25px]',
			thumb: 'w-[15px] h-[15px] data-[state=checked]:translate-x-[22px]',
		},
		sm: {
			root: 'w-[32px] h-[20px]',
			thumb: 'w-[12px] h-[12px] data-[state=checked]:translate-x-[16px]',
		},
		lg: {
			root: 'w-[52px] h-[30px]',
			thumb: 'w-[18px] h-[18px] data-[state=checked]:translate-x-[28px]',
		},
	}[size || 'md'];

	return (
		<SwitchPrimitive.Root
			className={cn(
				sizeStyles.root,
				'relative rounded-full flex items-center transition-colors',
				'bg-muted/50 backdrop-blur-sm data-[state=checked]:bg-colored data-[state=checked]:border-colored'
			)}
			{...props}
		>
			<SwitchPrimitive.Thumb
				className={cn(
					sizeStyles.thumb,
					'block rounded-full transition-all translate-x-1 will-change-transform',
					'bg-white'
				)}
			/>
		</SwitchPrimitive.Root>
	);
});

Switch.displayName = 'ColidySwitch';
