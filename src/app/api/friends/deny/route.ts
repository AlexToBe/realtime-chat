import { fetchRedis } from "@/helpers/redis"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { z } from "zod"

export async function POST(req:Request) {
    try {
        const body = await req.json()
        const {id: idToDeny} = z.object({id: z.string()}).parse(body)
        const session = await getServerSession(authOptions)
        if (!session) {
            return new Response("Unauthorized", { status: 401 })
        }

        const isAlreadyFriends = await fetchRedis('sismember',
            `user:${session.user.id}:friends`,idToDeny
        )
        if (isAlreadyFriends) {
            return new Response("already friends", { status: 400 })
            
        }

        const hasFriendRequest = await fetchRedis(
            'sismember',
            `user:${session.user.id}:incoming_friend_requests`,
            idToDeny
        )
        if (!hasFriendRequest) {
            return new Response("no friends request", { status: 400 })
        }

    
        
        // await db.srem(`user:${idToDeny}:outbound_friend_requests`, session.user.id)
        await db.srem(`user:${session.user.id}:incoming_friend_requests`,  idToDeny)

        return new Response('ok',{status:200})
    } catch (error) {
        console.log(error)
        if (error instanceof z.ZodError) {
            return new Response('invalid request payload', { status: 422 })
        }
        return new Response('invalid request', { status: 400 })

    }
} 