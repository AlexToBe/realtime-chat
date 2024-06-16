import { fetchRedis } from "@/helpers/redis"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { messageValidator } from "@/lib/valildations/message"
import { getServerSession } from "next-auth"
import { nanoid } from "nanoid"
import { pushServer } from "@/lib/pusher"
import { toPusherKey } from "@/lib/utils"
export async function POST(req:Request) {
    try {
        const { text, chatId } = await req.json()
        const session = await getServerSession(authOptions)
        if(!session) {
            return new Response("Unauthorized", { status: 401 })
        }
        const [userId1, userId2] = chatId.split('--')
        if(userId1 !== session.user.id &&userId2 !== session.user.id ) {
            return new Response("Unauthorized", { status: 401 })
        }

        const friendId = session.user.id === userId1 ? userId2 : userId1
        const friendList = await fetchRedis('smembers',`user:${session.user.id}:friends`) as string[]
        if(!friendList.includes(friendId)) {
            return new Response("Unauthorized", { status: 401 })
        }

        const rawSender = await fetchRedis('get', `user:${session.user.id}`) as string
        const sender = JSON.parse(rawSender) as User
        const timeStamp = Date.now()

        const messageData:Message = {
            id:nanoid(),
            senderId:session.user.id,
            text,
            timeStamp,
        }

        const message = messageValidator.parse(messageData)

        pushServer.trigger(toPusherKey(`chat:${chatId}`),
        'incoming_message',message
        )

        pushServer.trigger(toPusherKey(`user:${friendId}:chats`), 'new_message', {
            ...message,
            senderImg: sender.image,
            senderName:sender.name
        })

        await db.zadd(`chat:${chatId}:messages`, {
            score: timeStamp,
            member:JSON.stringify(message)
        })

        return new Response('ok')
    } catch (error ) {
        if (error instanceof Error) {
            return new Response(error.message, { status: 500 })
        }
        return new Response('Internal Server Error', { status: 500 })
    }
}