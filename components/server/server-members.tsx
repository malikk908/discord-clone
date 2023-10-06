"use client"

import { useModal } from "@/hooks/use-modal-store";
import { cn } from "@/lib/utils";
import { Channel, Member, Profile } from "@prisma/client";
import { useParams, useRouter } from "next/navigation";
import { UserAvatar } from "../user-avatar";


interface ServerMembersProps {
    icon: React.ReactNode
    name: string,
    id: string
    member: Member & { profile: Profile };

}

export const ServerMembers = ({
    icon,
    name,
    id,
    member
}: ServerMembersProps) => {

    const { onOpen } = useModal();

    const params = useParams();
    const router = useRouter();

    return (
        <button className={cn(
            "group px-2 py-2 rounded-md flex items-center justify-between  gap-x-2 w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition mb-1",
            params?.memberId === member?.id && "bg-zinc-700/20 dark:bg-zinc-700"
        )}>

            <div className="flex items-center">
                <UserAvatar
                    src={member.profile.imageUrl}
                    className="h-8 w-8 md:h-8 md:w-8"
                />

                <p className={cn(
                    "ml-4 line-clamp-1 font-semibold text-sm text-zinc-500 group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300 transition",
                    params?.channelId === member?.id && "text-primary dark:text-zinc-200 dark:group-hover:text-white"
                )}>
                    {name}
                </p>
            </div>

            <div>
                <p className="flex-shrink-0 w-5 h-5 text-zinc-500 dark:text-zinc-400">
                    {icon}
                </p>
            </div>


        </button>
    );
}

