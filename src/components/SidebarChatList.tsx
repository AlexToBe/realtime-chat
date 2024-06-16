'use client'
import { pushClient } from '@/lib/pusher'
import { chatHrefConstructor, toPusherKey } from '@/lib/utils'
import { Session } from 'inspector'
import { usePathname,useRouter } from 'next/navigation'

import {FC, useEffect, useState} from 'react'
import UnseenChatToast from './UnseenChatToast'
import toast from 'react-hot-toast'


interface SidebarChatListProps{ 
    friends: User[] 
    sessionId: string
}

interface ExtendedMessage extends Message{
    senderImg: string
    senderName:string
}

const SidebarChatList: FC<SidebarChatListProps> = ({ friends,sessionId }) => {
    const router = useRouter()
    const pathname = usePathname()
    
    const [unseenMessages, setUnseenMessages] = useState<Message[]>([])
    const [activeChats, setActiveChats] = useState<User[]>(friends)
        
    useEffect(() => {
       pushClient.subscribe(toPusherKey(`user:${sessionId}:chats`))
        pushClient.subscribe(toPusherKey(`user:${sessionId}:friends`))
        
        const chatHandler = (message: ExtendedMessage) => {
            const shouldNotify = pathname !==`/dashboard/chat/${chatHrefConstructor(sessionId,message.senderId)}`
            if (!shouldNotify) return
            console.log(message)

            toast.custom((t) => (
                <UnseenChatToast
                    t={t}
                    sessionId={sessionId}
                    senderId={message.senderId}
                    senderImg={message.senderImg}
                    senderMessage={message.text}
                    senderName={message.senderName}
                    
                />
            ))
            setUnseenMessages((prev) => [...prev, message])
           
        }

        const newFriendHandler = ( newFriend:User ) => {
            setActiveChats((prev) => [...prev, newFriend])
        }
        pushClient.bind('new_message',chatHandler)
        pushClient.bind('new_friend',newFriendHandler)

        return () => {
            pushClient.unsubscribe(toPusherKey(`user:${sessionId}:chats`))
            pushClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`))

            pushClient.unbind('new_message',chatHandler)
            pushClient.unbind('new_friend',newFriendHandler)
        }
    }, [pathname, sessionId,router])

    useEffect(() => {
        if (pathname?.includes('chat')) {
            setUnseenMessages((pre) => {
                return pre.filter((message) => !pathname.includes(message.senderId))
        })
        }
    },[pathname])

    return <ul role='list' className=' max-h-[25rem] overflow-y-auto -mx-2 space-y-1'>
        {activeChats.sort().map((friend) => {
            
            const unseenMessagesCount = unseenMessages.filter((unseenmsg) => {
                return unseenmsg.senderId === friend.id
            }).length

            return <li key={friend.id} >
                <a href={`/dashboard/chat/${chatHrefConstructor(sessionId, friend.id)}`}
                className=' text-gray-700 hover:text-indigo-600 hover:bg-gray-50 flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'>
                    {friend.name}
                    {unseenMessagesCount > 0 && <div className=' text-xs font-semibold  bg-indigo-600 text-gray-400 w-4 h-4  rounded-full flex  justify-center items-center' > {unseenMessagesCount} </div>}
                </a>
            </li>
        

        })}
    
    </ul>


}

export default SidebarChatList