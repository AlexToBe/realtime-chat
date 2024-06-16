import { getFriendsByUserId } from '@/helpers/get-friends-by-user-id'
import { fetchRedis } from '@/helpers/redis'
import { authOptions } from '@/lib/auth'
import { chatHrefConstructor } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'
import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'
import  Image  from 'next/image'

const page = async ({}) => {
    const session = await getServerSession(authOptions)
    if (!session) {
        notFound()
    }

    const friends = await getFriendsByUserId(session.user.id)
    const friendWithLastMessage = await Promise.all(
        friends.map(async (friend) => {
            const [lastMessageRaw] = await fetchRedis(
                'zrange',
                `chat:${chatHrefConstructor( session.user.id,friend.id)}:messages`,
                0,
                -1,
            ) as string[]
            const lastMessage = JSON.parse(lastMessageRaw) as Message
            return {
                ...friend,
                lastMessage,
            }
        })
    )


    return (
    <div className=' container py-12' >
        <h1 className=' font-bold text-5xl mb-8' > Recent chats </h1>
            {friendWithLastMessage.length === 0 ? (
                <p className=' text-sm text-zinc-300'>Nothing to show here...</p>
            ) : friendWithLastMessage.map(
            (friend) => (
                    <div key={friend.id} className=' relative bg-zinc-50 border border-zinc-200 
                rounded-md p-3'>
                        <div className=' absolute right-4 inset-y-0 flex items-center' > 
                            <ChevronRight className=' h-7 w-7 text-zinc-400' />
                        </div>
                        <Link href={`/dashboard/chat/${chatHrefConstructor(
                            session.user.id,
                            friend.id
                        )}`} className=' relative sm:flex'>
                            <div className=' mb-4 flex-shrink-0 sm:mb-0 sm:mr-4'>
                                
                                
                                <div className=' relative h-6 w-6' >

                                    <Image
                                    referrerPolicy='no-referrer'
                                    className=' rounded-full'
                                    alt=''
                                    src = {friend.image || ''}
                                    fill = {true}
                                    />
                                </div>
                            </div>
                            <div>
                                <h4 className=' text-lg font-semibold'> { friend.name}</h4>
                                <p className=' mt-1 max-w-md'>
                                    <span className=' text-zinc-400' >
                                        {friend.lastMessage.senderId === session.user.id ?
                                            'You: ':''}
                                    </span>
                                    {friend.lastMessage.text}
                                </p>
                            </div>
                        </Link>
                </div>
            )
        )}
    </div>
    )
}

export default page
