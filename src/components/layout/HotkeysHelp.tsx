"use client";

import { motion, AnimatePresence } from 'motion/react';
import { useHover } from '@uidotdev/usehooks'
import { RiQuestionLine } from '@remixicon/react';

export default function HotkeysHelp() {
	const [ref, hovering] = useHover();

	return <></>;

	return (
		<>
			<motion.span
				ref={ref}
				animate={{
					width: hovering ? '22.5rem' : '6rem',
					height: hovering ? '9.5rem' : '6rem',
				}}
				className="fixed right-0 bottom-0 w-24 h-24 select-none z-50"
			/>
			<motion.div
				className="fixed right-10 bottom-10 w-12 h-12 text-muted rounded-[1.5rem] bg-secondary border shadow-md flex items-center justify-center"
				animate={{ width: `${hovering ? 20 : 3}rem`, height: `${hovering ? 7 : 3}rem` }}
			>
				<AnimatePresence mode="wait">
					{!hovering && (
						<motion.div
							key="icon"
							initial={{ opacity: 0, scale: 0.5 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.5 }}
						>
							<RiQuestionLine />
						</motion.div>
					)}
					{hovering && (
						<motion.div
							key="content"
							initial={{ opacity: 0, scale: 0.5 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.5 }}
							className="text-muted space-y-2 w-full h-full p-5"
						>
							<div className="flex items-center justify-between">
								<h1>Çubuğu Genişlet</h1>
								<div className="w-8 h-8 flex items-center justify-center">
									<span className="font-mono shadow-[inset_0_-2px_4px_var(--color-primary)] text-sm bg-secondary border border-b-4 rounded-md py-1 px-3">E</span>
								</div>
							</div>
							<div className="flex items-center justify-between">
								<h1>Kullanıcı Menüsü</h1>
								<div className="w-8 h-8 flex items-center justify-center">
									<span className="font-mono shadow-[inset_0_-2px_4px_var(--color-primary)] text-sm bg-secondary border border-b-4 rounded-md py-1 px-3">P</span>
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence >
			</motion.div>
		</>
	);
};