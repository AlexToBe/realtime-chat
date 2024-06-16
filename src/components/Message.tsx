'use client'
import { cn, toPusherKey } from '@/lib/utils'
import { FC, useEffect, useRef, useState } from 'react'
import { format } from 'date-fns'
import  Image  from 'next/image'
import { pushClient } from '@/lib/pusher'

interface MessagesProps{ 
    initialMessages: Message[]
    sessionId: string
    sessionImg: string |null|undefined
    chatId:string
    chatPartner:User
}


const Messages: FC<MessagesProps> = ({ 
    initialMessages,
    sessionId,
    chatId,
    sessionImg,
    chatPartner
}) => {

    const[messages,setMessages] = useState<Message[]>(initialMessages)

      useEffect(() => {
        pushClient.subscribe(toPusherKey(`chat:${chatId}`))
        
        const messageHandler = ( message:Message) => {
            setMessages((pre)=>[...pre,message])
        }
        pushClient.bind('incoming_message', messageHandler)
      
        return () => {
            pushClient.unsubscribe(toPusherKey(`chat:${chatId}`))
             pushClient.unbind('incoming_message', messageHandler)
     
        }
    }),[chatId]

    const scrollDownRef = useRef<HTMLDivElement|null>(null)

    const formatTimestamp = (timeStamp: number) => {
        const date = new Date(timeStamp)
        return  date.toLocaleTimeString()
    }

    // const formatTimestamp = (timeStamp: number) => {
    //     return format(timeStamp, 'HH:MM')
    // }
    return <div id='messages' className='flex flex-1 flex-col-reverse gap-5  space-y-reverse py-3 overflow-y-auto  
            scrollbar-thumb-blue  scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch' >
            <div ref={ scrollDownRef}>
            {
                messages.map((message, index) => {
                    const isCurrentUse = message.senderId === sessionId
                    const hasNextMessageFromSameUser = messages[index - 1]?.senderId === messages[index].senderId
                   

                    return <div key={`${message.id}-${message.timeStamp}`}
                        className=''>
                        <div className={cn('flex items-end space-x-2   ', {
                            'justify-end': isCurrentUse,
                            'justify-start': !isCurrentUse
                        })}>
                            <div className={cn('flex flex-col space-y-4 text-base max-w-xs mx-2',
                                {
                                    'order-1 items-end': isCurrentUse,
                                    'order-2 items-start': !isCurrentUse
                                }
                            )} >
                                <span className={cn(' px-4 py-2 rounded-lg inline-block', {
                                    'bg-indigo-600 text-white': isCurrentUse,
                                    'bg-gray-100 text-gray-600': !isCurrentUse,
                                    'rounded-br-none': hasNextMessageFromSameUser && isCurrentUse,
                                    'rounded-bl-none': hasNextMessageFromSameUser && !isCurrentUse
                                    })} >
                                    {message.text}{' '}
                                        <span className='text-xs ml-2 text-gray-400'>
                                        { formatTimestamp( message.timeStamp)}
                                        </span>
                                </span>
                               
                            </div>
                            <div className={cn('relative w-6 h-6', {
                                'order-2': isCurrentUse,
                                'order-1': !isCurrentUse,
                                'invisible':hasNextMessageFromSameUser
                            })} >
                                  <Image
                                    referrerPolicy='no-referrer'
                                    className=' rounded-full'
                                    alt=''
                                    src = {isCurrentUse?(sessionImg as string)  : chatPartner.image}
                                    fill = {true}
                                    />
                            </div>
                        </div>
                    </div>
            })}
            </div>
        </div>


}

export default Messages