import { fetchRedis } from "@/helpers/redis"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { pushServer } from "@/lib/pusher"
import { toPusherKey } from "@/lib/utils"
import { getServerSession } from "next-auth"
import { z } from "zod"

export async function POST(req:Request) {
    try {
        const body = await req.json()
        const {id: idToAdd} = z.object({id: z.string()}).parse(body)
        const session = await getServerSession(authOptions)
        if (!session) {
            return new Response("Unauthorized", { status: 401 })
        }

        const isAlreadyFriends = await fetchRedis('sismember',
            `user:${session.user.id}:friends`,idToAdd
        )
        if (isAlreadyFriends) {
            return new Response("already friends", { status: 400 })
            
        }

        const hasFriendRequest = await fetchRedis(
            'sismember',
            `user:${session.user.id}:incoming_friend_requests`,
            idToAdd
        )
        if (!hasFriendRequest) {
            return new Response("no friends request", { status: 400 })
        }

        const [userRaw, friendRaw] = (
            await Promise.all([
            fetchRedis('get',`user:${session.user.id}`),
            fetchRedis('get',`user:${idToAdd}`)]
            )) as [string, string]
        
        const user = JSON.parse(userRaw) as User
        const friend = JSON.parse(friendRaw) as User
        
        await Promise.all([
            pushServer.trigger( toPusherKey(`user:${idToAdd}:friends`), 'new_friend',user ) ,
            pushServer.trigger( toPusherKey(`user:${session.user.id}:friends`), 'new_friend',friend ) ,
            db.sadd( `user:${session.user.id}:friends`,idToAdd ),

            db.sadd(`user:${idToAdd}:friends`, session.user.id),
            db.srem(`user:${session.user.id}:incoming_friend_requests`,  idToAdd)

        ])



        // await db.sadd( `user:${session.user.id}:friends`,idToAdd )

        // await db.sadd(`user:${idToAdd}:friends`, session.user.id)
        
        // await db.srem(`user:${idToAdd}:outbound_friend_requests`, session.user.id)
        // await db.srem(`user:${session.user.id}:incoming_friend_requests`,  idToAdd)

        return new Response('ok')
    } catch (error) {
        console.log(error)
        if (error instanceof z.ZodError) {
            return new Response('invalid request payload', { status: 422 })
        }
        return new Response('invalid request', { status: 400 })

    }
} 