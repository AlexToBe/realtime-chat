'use client'
import { pushClient } from '@/lib/pusher'
import { toPusherKey } from '@/lib/utils'
import { User } from 'lucide-react'
import Link from 'next/link'
import {FC, useEffect, useState} from 'react'

interface FriendRequestsSidebarOptionProps{ 
    sessionId:string
    initalUnseenRequestCount:number
}

const FriendRequestsSidebarOption: FC<FriendRequestsSidebarOptionProps> = ({ sessionId,initalUnseenRequestCount}) => {
    const [unSeenRequestCount, SetUnSeenRequestCount] = useState<number>(
        initalUnseenRequestCount
    )

       useEffect(() => {
        pushClient.subscribe(toPusherKey(`user:${sessionId}:incoming_friend_requests`))
           
        pushClient.subscribe(toPusherKey(`user:${sessionId}:friends`))
        
        const friendRequestsHandler = () => {
            SetUnSeenRequestCount((pre)=>pre+1)
        }
           
        const addedFriendHandler = () => {
            SetUnSeenRequestCount((pre)=>pre-1)
        }
           
        pushClient.bind('incoming_friend_requests', friendRequestsHandler)
           
        pushClient.bind('new_friend', addedFriendHandler)
      
        return () => {
            pushClient.unsubscribe(toPusherKey(`user:${sessionId}:incoming_friend_requests`))
            pushClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`))

             pushClient.unbind('incoming_friend_requests', friendRequestsHandler)
             pushClient.unbind('new_friend', addedFriendHandler)
     
        }
    },[sessionId])
    return <Link href='/dashboard/requests'
        className=' text-gray-700 hover:text-indigo-600
         hover:bg-gray-50 flex items-center gap-x-3
         rounded-md p-2 text-sm leading-6 font-semibold'>
            <div className=' text-gray-400 border-gray-200 group-hover:border-indigo-600
            group-hover:text-indigo-600 flex h-6 w-6 shrink-0 items-center 
            justify-center rounded-lg border text-[0.625]
                font-medium bg-white' >
                <User className=' h-4 w-4'/>
            </div>
            <p className='truncate' > Friend requests</p>
        {unSeenRequestCount > 0 ? (
            <div className=' rounded-full w-5 h-5 text-sm flex justify-center items-center text-white bg-indigo-600' >{ unSeenRequestCount}</div>
            ):null}
         </Link>


}

export default FriendRequestsSidebarOption