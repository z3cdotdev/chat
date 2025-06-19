import { cn } from "@colidy/ui-utils";
import { User } from "better-auth";
import md5 from "md5";
import { useState } from "react";

export const Avatar = ({
	user,
	className = "",
}: {
	user: User & { username?: string };
	className?: string;
}) => {
	const [imgError, setImgError] = useState(false);
	const gravatarUrl = [
		"https://s.gravatar.com/avatar/",
		md5(user.email),
		"?s=480",
		"&r=pg",
		"&d=404"
	].join("");

	return (
		<div className={cn(className)}>
			{user.image && user.image.trim() ? (
				<img
					src={imgError ? (user.image || gravatarUrl) : gravatarUrl}
					alt={user.username || user.email}
					onError={() => setImgError(true)}
					className="w-full h-full object-cover rounded-full"
				/>
			) : (
				<div className="bg-gray-200 w-full h-full flex items-center justify-center">
					<span className="text-gray-500">
						{(user.username || user.email).charAt(0).toUpperCase()}
					</span>
				</div>
			)}
		</div>
	);
};