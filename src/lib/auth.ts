import { NextAuthOptions } from "next-auth";
import { UpstashRedisAdapter } from "@next-auth/upstash-redis-adapter";
import { db } from "./db";
import  GithubProvider  from "next-auth/providers/github";
import { fetchRedis } from "@/helpers/redis";
function getGithubCredentials() {
   
    const clientId = process.env.GITHUB_ID;    
    const clientSecret = process.env.GITHUB_SECRET;

    if (!clientId || clientId.length === 0) {
        throw new Error('Missing  GITHUB_ID')
    }

    if (!clientSecret || clientSecret.length === 0) {
        throw new Error('Missing  GITHUB_SECRET')
    }

    return {clientId, clientSecret}
}

export const authOptions: NextAuthOptions = {
    
    adapter: UpstashRedisAdapter(db),
    session: {
        strategy:'jwt'
    },
    pages: {
        signIn:'/login'
    },
    providers: [
        GithubProvider({
            clientId: getGithubCredentials().clientId,
            clientSecret:getGithubCredentials().clientSecret
        })
    ],
    callbacks: {
        async jwt ({token, user}) {
            // const dbUser = (await db.get(`user:${token.id}`)) as User | null
            const dbUserReuslt = (await fetchRedis('get',`user:${token.id}`)) as string|null
            if (!dbUserReuslt) {
                if (user) {
                    token.id = user.id
                }
                else {
                    token.id ='s'
                }
                return token
            }
            const dbUser = JSON.parse(dbUserReuslt!)
            return {
                id: dbUser.id,
                name:dbUser.name,
                email:dbUser.email,
                image:dbUser.image
            }
        },
        async session ({session, token}) {
            if (token) {
                session.user.id = token.id
                session.user.name = token.name
                session.user.email = token.email
                session.user.image = token.image as string
            }
            return session
        },
        redirect() {
            return '/dashboard'
        }
    }
}