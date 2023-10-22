import { Member, MemberRole, Profile } from "@prisma/client"
import { UserAvatar } from "../user-avatar"
import { FileIcon, ShieldAlert, ShieldCheck } from "lucide-react"
import { ActionTooltip } from "../action-tooltip"
import Image from "next/image"


const roleIconMap = {
    [MemberRole.GUEST]: null,
    [MemberRole.MODERATOR]: <ShieldCheck className="h-4 w-4 text-indigo-500" />,
    [MemberRole.ADMIN]: <ShieldAlert className="h-4 w-4 text-rose-500" />
}


interface ChatItemProps {
    content: string
    timestamp: string
    member: Member & {
        profile: Profile
    }
    fileUrl: string | null
}

export const ChatItem = ({
    content,
    timestamp,
    member,
    fileUrl,

}: ChatItemProps) => {

    const fileType = fileUrl?.split('.').pop()

    const isPDF = fileType === "pdf" && fileUrl
    const isImage = !isPDF && fileUrl


    return (
        <div className="flex gap-2 py-4" >
            <UserAvatar
                src={member.profile.imageUrl}
            />
            <div className="flex flex-col w-full">
                <div className="flex gap-x-2">

                    <div className="flex items-center gap-2">
                        <p className="font-semibold text-base hover:underline cursor-pointer">
                            {member.profile.name}
                        </p>
                        <ActionTooltip label={member.role} >
                            {roleIconMap[member.role]}
                        </ActionTooltip>
                    </div>

                    <span className="flex items-center text-xs text-zinc-400">
                        {timestamp}
                    </span>

                </div>

                {isImage && (
                    <a 
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative aspect-square rounded-md mt-2 overflow-hidden border flex items-center bg-secondary h-48 w-48"
                  >
                    <Image
                      src={fileUrl}
                      alt={content}
                      fill
                      className="object-cover"
                    />
                  </a>
                )
                 }


                {isPDF &&
                    <div className="relative flex items-center mt-2 p-2 rounded-md bg-background/10">
                        <FileIcon className="w-10 h-10 fill-indigo-200 stroke-indigo-400" />
                        <a 
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline"
                        >
                            PDF File
                        </a>
                    </div>}

                {!fileUrl &&
                    <p className="text-sm">
                        {content}
                    </p>
                }

            </div>

        </div>
    )

}