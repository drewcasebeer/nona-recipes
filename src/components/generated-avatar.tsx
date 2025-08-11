import { createAvatar } from "@dicebear/core";
import { botttsNeutral, initials, funEmoji } from "@dicebear/collection";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface GeneratedAvatarProps {
	seed: string;
	className?: string;
	variant: "botttsNeutral" | "initials" | "funEmoji";
}

export const GeneratedAvatar = ({ seed, className, variant }: GeneratedAvatarProps) => {
	let avatar;

	if (variant === "botttsNeutral") {
		avatar = createAvatar(botttsNeutral, {
			seed,
		});
	} else if (variant === "initials") {
		avatar = createAvatar(initials, {
			seed,
			fontWeight: 500,
			fontSize: 42,
		});
	} else if (variant === "funEmoji") {
		avatar = createAvatar(funEmoji, {
			seed,
		});
	}
		return (
			<Avatar className={cn(className)}>
				<AvatarImage src={avatar?.toDataUri()} alt="Avatar" />
				<AvatarFallback>{seed.charAt(0).toUpperCase()}</AvatarFallback>
			</Avatar>
		);
};
