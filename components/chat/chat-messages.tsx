"use client";

import { useChatQuery } from "@/hooks/use-chat-query";
import { Member, Message, Profile } from "@prisma/client";
import { Loader2, ServerCrash } from "lucide-react";
import { ChatWelcome } from "./chat-welcome";
import { ElementRef, Fragment, useEffect, useRef } from "react";
import { ChatItem } from "./chat-item";
import { format } from "date-fns"
import { useChatSocket } from "@/hooks/use-chat-socket";
import { useChatScroll } from "@/hooks/use-chat-scroll";

const DATE_FORMAT = "d MMM yyyy, HH:mm"

type MessageWithMemberWithProfile = Message & {
    member: Member & {
        profile: Profile
    }
}

interface ChatMessagesProps {
    name: string;
    member: Member;
    chatId: string;
    apiUrl: string;
    socketUrl: string;
    socketQuery: Record<string, string>;
    paramKey: "channelId" | "conversationId";
    paramValue: string;
    type: "channel" | "conversation";
}


export const ChatMessages = ({
    name,
    member,
    chatId,
    apiUrl,
    socketUrl,
    socketQuery,
    paramKey,
    paramValue,
    type,
}: ChatMessagesProps) => {

    const queryKey = `chat:${chatId}`;
    const addKey = `chat:${chatId}:messages`
    const updateKey = `chat:${chatId}:messages:update`

    const chatRef = useRef<ElementRef<"div">>(null)
    const bottomRef = useRef<ElementRef<"div">>(null)


    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
    } = useChatQuery({
        queryKey,
        apiUrl,
        paramKey,
        paramValue,
    });

    // const chatContainer = chatRef.current;

    // // Get the current scroll position
    // const scrollPosition = chatContainer ? chatContainer.scrollTop : 0;

    // useEffect(() => {
    //     if (chatContainer) {
    //       chatContainer.scrollTop = scrollPosition;
    //       console.log(chatContainer.scrollTop)
    //       console.log(scrollPosition)
    //     }
    //   }, [data]);
  

    useChatSocket({ addKey, updateKey, queryKey })

    useChatScroll({ 
        chatRef, 
        bottomRef,
        loadMore: fetchNextPage,
        shouldLoadMore: !isFetchingNextPage && hasNextPage,
        count: data?.pages?.[0].items?.length ?? 0,
    })

    if (status === "pending") {
        return (
            <div className="flex flex-col flex-1 justify-center items-center">
                <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Loading messages...
                </p>
            </div>
        )
    }

    if (status === "error") {
        return (
            <div className="flex flex-col flex-1 justify-center items-center">
                <ServerCrash className="h-7 w-7 text-zinc-500 my-4" />
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Something went wrong!
                    {error?.message}
                </p>
            </div>
        )
    }

    return (
        <div ref={chatRef} className="flex-1 flex flex-col py-4 overflow-y-auto">
            {!hasNextPage &&
                <>
                    <div className="flex-1" />
                    <ChatWelcome
                        type={type}
                        name={name}
                    />
                </>
            }
            {hasNextPage && (
                <div className="flex justify-center">
                    {isFetchingNextPage ? (
                        <Loader2 className="h-6 w-6 text-zinc-500 animate-spin my-4" />) : (
                        <button
                            onClick={() => fetchNextPage()}
                            className="text-xs my-4 text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition ">
                            Load previous messages
                        </button>
                    )}
                </div>
            )}

            <div className="flex flex-col-reverse mt-auto px-4">
                {data?.pages?.map((group, i) => (
                    <Fragment key={i}>
                        {group.items.map((message: MessageWithMemberWithProfile) => (
                            <ChatItem
                                key={message.id}
                                id={message.id}
                                content={message.content}
                                member={message.member}
                                currentMember={member}
                                timestamp={format(new Date(message.createdAt), DATE_FORMAT)}
                                fileUrl={message.fileUrl}
                                deleted={message.deleted}
                                isUpdated={message.createdAt !== message.updatedAt}
                                socketUrl={socketUrl}
                                socketQuery={socketQuery}
                            />
                        ))}
                    </Fragment>
                ))}
            </div>
            <div ref={bottomRef}/>
        </div>
    )
}