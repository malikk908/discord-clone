import ChatHeader from "@/components/chat/chat-header"
import { ChatInput } from "@/components/chat/chat-input"
import { ChatMessages } from "@/components/chat/chat-messages"
import { findOrCreateConversation } from "@/lib/conversation"
import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db"
import { redirectToSignIn } from "@clerk/nextjs"
import { redirect } from "next/navigation"

interface MemberIdPageProps {
    params: {
        serverId: string
        memberId: string
    }
}


const MemberIdPage = async ({
    params
}: MemberIdPageProps) => {

    const profile = await currentProfile()

    if (!profile) {
        return redirectToSignIn()
    }

    const currentMember = await db.member.findFirst({
        where: {
            serverId: params.serverId,
            profileId: profile.id
        },
        include: {
            profile: true
        }
    })

    if (!currentMember) {
        redirect('/')
    }

    const conversation = await findOrCreateConversation(currentMember.id, params.memberId)

    if (!conversation) {
        return redirect(`/servers/${params.serverId}`);
    }

    const { memberOne, memberTwo } = conversation


    const otherMember = memberOne.profileId === profile.id ? memberTwo : memberOne


    return (
        <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
            <ChatHeader
                name={otherMember.profile.name}
                imageUrl={otherMember.profile.imageUrl}
                serverId={params.serverId}
                type="conversation" />

            <ChatMessages
                member={currentMember}
                name={otherMember.profile.name}
                chatId={conversation.id}
                type="conversation"
                apiUrl="/api/direct-messages"
                socketUrl="/api/socket/direct-messages"
                socketQuery={{
                    conversationId: conversation.id
                }}
                paramKey="conversationId"
                paramValue={conversation.id}
            />

            <ChatInput
                apiUrl="/api/socket/direct-messages"
                query={{
                    conversationId: conversation.id
                }}
                type="conversation"
                name={otherMember.profile.name} />

        </div>
    );
}

export default MemberIdPage
