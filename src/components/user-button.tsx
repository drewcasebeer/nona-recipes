import { GeneratedAvatar } from "@/components/generated-avatar";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import { authClient } from "@/lib/auth-client";
import { ChevronDown, LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Skeleton } from "./ui/skeleton";

export const UserButton = () => {
	const router = useRouter();
	const isMobile = useIsMobile();
	const { data, isPending } = authClient.useSession();

	const onLogout = () => {
		authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					router.push("/sign-in");
				},
			},
		});
	};

	if (isPending || !data) {
		return (
			<Skeleton className="h-9 w-9 rounded-full" />
		);
	}

	if (isMobile) {
		return (
			<Drawer>
				<DrawerTrigger className="rounded-lg border border-border/10 p-3 w-full flex items-center justify-between  overflow-hidden gap-x-2">
					{data.user.image ? (
						<Avatar>
							<AvatarImage src={data.user.image} />
						</Avatar>
					) : (
						<GeneratedAvatar seed={data.user.name} variant="funEmoji" className="size-9 mr-3" />
					)}
				</DrawerTrigger>

				<DrawerContent>
					<DrawerHeader>
						<DrawerTitle>{data.user.name}</DrawerTitle>
						<DrawerDescription>{data.user.email}</DrawerDescription>
					</DrawerHeader>

					<DrawerFooter>
						<Button variant="outline" onClick={onLogout}>
							<LogOutIcon className="size-4 text-black" />
							Logout
						</Button>
					</DrawerFooter>
				</DrawerContent>
			</Drawer>
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger className="w-full flex items-center justify-between overflow-hidden gap-x-2">
				{data.user.image ? (
					<Avatar>
						<AvatarImage src={data.user.image} />
					</Avatar>
				) : (
					<GeneratedAvatar seed={data.user.name} variant="funEmoji" className="size-9 mr-3" />
				)}
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end" side="right" className="w-72">
				<DropdownMenuLabel>
					<div className="flex flex-col gap-1">
						<span className="font-medium truncate">{data.user.name}</span>
						<span className="text-sm font-normal text-muted-foreground truncate">{data.user.email}</span>
					</div>
				</DropdownMenuLabel>

				<DropdownMenuSeparator />

				<DropdownMenuItem className="cursor-pointer flex items-center justify-between" onClick={onLogout}>
					Logout
					<LogOutIcon className="size-4" />
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
