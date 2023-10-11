import { currentProfile } from "@/lib/current-profile";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ChannelType, MemberRole } from "@prisma/client";

import { Hash, Mic, ShieldAlert, ShieldCheck, Video } from "lucide-react";

import { ServerHeader } from "@/components/server/server-header"
import { ServerSearch } from "@/components/server/server-search";
import { ServerSection } from "@/components/server/server-section";
import { Separator } from "@/components/ui/separator";
import { ServerChannels } from "./server-channels";
import { ServerMembers } from "./server-members";


interface ServerSidebarProps {
    serverId: string;
}

const iconMap = {
    [ChannelType.TEXT]: <Hash className="mr-2 h-4 w-4" />,
    [ChannelType.AUDIO]: <Mic className="mr-2 h-4 w-4" />,
    [ChannelType.VIDEO]: <Video className="mr-2 h-4 w-4" />
};

const roleIconMap = {
    [MemberRole.GUEST]: null,
    [MemberRole.MODERATOR]: <ShieldCheck className="h-4 w-4 mr-2 text-indigo-500" />,
    [MemberRole.ADMIN]: <ShieldAlert className="h-4 w-4 mr-2 text-rose-500" />
}

export const ServerSidebar = async ({
    serverId
}: ServerSidebarProps) => {

    const profile = await currentProfile()

    if (!profile) {
        return redirect('/');
    }

    const server = await db.server.findUnique({
        where: {
            id: serverId,
        },
        include: {
            channels: {
                orderBy: {
                    createdAt: "asc",
                },
            },
            members: {
                include: {
                    profile: true,
                },
                orderBy: {
                    role: "asc",
                }
            }
        }
    });

    const textChannels = server?.channels.filter((channel) => channel.type === ChannelType.TEXT)

    const audioChannels = server?.channels.filter((channel) => channel.type === ChannelType.AUDIO)

    const videoChannels = server?.channels.filter((channel) => channel.type === ChannelType.VIDEO)

    const members = server?.members.filter((member) => member.profileId !== profile.id)

    if (!server) {
        return redirect("/");
    }

    const role = server.members.find((member) => member.profileId === profile.id)?.role;

    return (
        <div className="flex flex-col h-full text-primary w-full dark:bg-[#2B2D31] bg-[#F2F3F5]">
            <ServerHeader
                server={server}
                role={role}
            />
            <ServerSearch data={[
                {
                    label: "Text Channels",
                    type: "channel",
                    data: textChannels?.map(channel => ({
                        id: channel.id,
                        icon: iconMap[channel.type],
                        name: channel.name
                    }

                    ))
                },
                {
                    label: "Audio Channels",
                    type: "channel",
                    data: audioChannels?.map(channel => ({
                        id: channel.id,
                        icon: iconMap[channel.type],
                        name: channel.name
                    }

                    ))
                },
                {
                    label: "Video Channels",
                    type: "channel",
                    data: videoChannels?.map(channel => ({
                        id: channel.id,
                        icon: iconMap[channel.type],
                        name: channel.name
                    }

                    ))
                },
                {
                    label: "Members",
                    type: "member",
                    data: members?.map(member => ({
                        id: member.id,
                        icon: roleIconMap[member.role],
                        name: member.profile.name
                    }

                    ))
                },
            ]}
            />
            <Separator className="bg-zinc-200 dark:bg-zinc-700 rounded-md my-2" />

            {!!textChannels?.length &&

                <div className="mb-2">
                    <ServerSection
                        label="Text Channels"
                        role={role}
                        sectionType="channels"
                        server={server}
                        channelType={ChannelType.TEXT} />


                    <div className="space-y-[2px]">
                        {textChannels?.map((channel) => {
                            return <ServerChannels
                                key={channel.id}
                                channel={channel}
                                server={server}
                                role={role}
                                icon={iconMap[channel.type]}
                                name={channel.name} />
                        })}
                    </div>
                </div>}

            {!!audioChannels?.length &&

                <div className="mb-2">

                    <ServerSection
                        label="Audio Channels"
                        role={role}
                        sectionType="channels"
                        server={server}
                        channelType={ChannelType.AUDIO} />


                    <div className="space-y-[2px]">
                        {audioChannels?.map((channel) => {
                            return <ServerChannels
                                key={channel.id}
                                channel={channel}
                                server={server}
                                icon={iconMap[channel.type]}
                                name={channel.name} />
                        })}
                    </div>
                </div>}

            {!!videoChannels?.length &&

                <div className="mb-2">

                    <ServerSection
                        label="Video Channels"
                        role={role}
                        sectionType="channels"
                        server={server}
                        channelType={ChannelType.VIDEO} />


                    <div className="space-y-[2px]">
                        {videoChannels?.map((channel) => {
                            return <ServerChannels
                                key={channel.id}
                                channel={channel}
                                server={server}
                                icon={iconMap[channel.type]}
                                name={channel.name} />
                        })}
                    </div>

                </div>}

            {!!members?.length &&

                <div className="mb-2">
                    <ServerSection
                        label="Members"
                        role={role}
                        sectionType="members"
                        server={server}
                    />

                    <div className="space-y-[2px]">
                        {members?.map((member) => {
                            return <ServerMembers
                                key={member.id}
                                member={member}
                                id={member.id}
                                icon={roleIconMap[member.role]}
                                name={member.profile.name} />
                        })}
                    </div>
                </div>}




        </div>
    )




}
