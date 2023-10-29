import { Member, MemberRole, Profile } from "@prisma/client"
import { UserAvatar } from "../user-avatar"
import { Edit, FileIcon, ShieldAlert, ShieldCheck, Trash } from "lucide-react"
import { ActionTooltip } from "../action-tooltip"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import axios from "axios";
import qs from "query-string";
import { Form, FormControl, FormField, FormItem } from "../ui/form"
import { Input } from "../ui/input"
import { useRouter } from "next/navigation"
import { Button } from "../ui/button"
import { useModal } from "@/hooks/use-modal-store"


const formSchema = z.object({
    content: z.string().min(1),
})


const roleIconMap = {
    [MemberRole.GUEST]: null,
    [MemberRole.MODERATOR]: <ShieldCheck className="h-4 w-4 text-indigo-500" />,
    [MemberRole.ADMIN]: <ShieldAlert className="h-4 w-4 text-rose-500" />
}


interface ChatItemProps {
    id: string
    content: string
    timestamp: string
    member: Member & {
        profile: Profile
    }
    fileUrl: string | null
    currentMember: Member
    deleted: boolean
    isUpdated: boolean
    socketUrl: string
    socketQuery: Record<string, string>
}

export const ChatItem = ({
    id,
    content,
    timestamp,
    member,
    currentMember,
    fileUrl,
    deleted,
    isUpdated,
    socketUrl,
    socketQuery,    

}: ChatItemProps) => {

    useEffect(() => {
      const handleKeyDown = (event: any) => {
        if(event.key === "Escape" || event.keyCode === 27){
            setIsEditing(false)
        }
      };

      window.addEventListener('keydown', handleKeyDown)
    
      return () => {
        window.removeEventListener("keydown", handleKeyDown)
      }
    }, [])
    

    const router = useRouter();

    const { onOpen } = useModal()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            content: content
        }
    })

    const isLoading = form.formState.isSubmitting

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const url = qs.stringifyUrl({
              url: `${socketUrl}/${id}`,
              query: socketQuery              
            });
      
            await axios.patch(url, values);
      
            form.reset();
            setIsEditing(false)
          } catch (error) {
            console.log(error);
          }
    }

    


    const [isEditing, setIsEditing] = useState(false)

    const fileType = fileUrl?.split('.').pop()

    const isAdmin = currentMember.role === MemberRole.ADMIN
    const isModerator = currentMember.role === MemberRole.MODERATOR
    const isOwner = currentMember.id === member.id
    const canDeleteMessage = !deleted && (isAdmin || isModerator || isOwner)
    const canEditMessage = !deleted && isOwner && !fileUrl

    const isPDF = fileType === "pdf" && fileUrl
    const isImage = !isPDF && fileUrl


    return (
        <div className="relative group flex gap-2 py-4 px-2 hover:bg-black/5 rounded-md" >
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

                {!fileUrl && !isEditing &&
                    <p className={cn("text-sm text-zinc-600 dark:text-zinc-300", deleted && "italic text-zinc-500 dark:text-zinc-400 text-xs mt-1")}>
                        {content}
                        {isUpdated && !deleted && (
                            <span className="text-[10px] mx-2 text-zinc-500 dark:text-zinc-400">
                                (edited)
                            </span>
                        )}
                    </p>
                }

                {!fileUrl && isEditing && (
                    <Form {...form}>
                    <form 
                    className="flex items-center w-full gap-x-2 pt-2"
                    onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormControl>
                                        <div className="relative w-full">
                                            
                                            <Input
                                                disabled={isLoading}
                                                className="p-2 bg-zinc-200/90 dark:bg-zinc-700/75 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200"
                                                
                                                {...field}
                                            />
                                            
                                        </div>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <Button disabled={isLoading} size="sm" variant="primary">
                            Save
                        </Button>
                    </form>
                    <span className="text-[11px] mt-1 text-zinc-400">
                        Press escape to cancel, enter to save
                    </span>
                </Form>
                )

                }

            </div>

            { canDeleteMessage && (

                <div className="hidden group-hover:flex items-center gap-x-2 absolute right-5 -top-2 p-1 bg-white dark:bg-zinc-800 border rounded-sm  ">
                    {canEditMessage && (                    
                    <ActionTooltip label="Edit">
                        <Edit 
                        onClick={()=>{setIsEditing(true)}} 
                        className="w-4 h-4 cursor-pointer text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition" />
                    </ActionTooltip>
                    )}

                    <ActionTooltip label="Delete">
                        <Trash 
                        onClick={()=> onOpen('deleteMessage', { apiUrl: `${socketUrl}/${id}`, query: socketQuery, })}
                        className="w-4 h-4 cursor-pointer text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition" />
                    </ActionTooltip>

                </div>

                )
            }

        </div>
    )

}