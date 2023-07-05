import { UpstashRedisAdapter } from "@next-auth/upstash-redis-adapter";
import { NextAuthOptions } from "next-auth";
import { db } from "./db";
import GoogleProvider from "next-auth/providers/google";
import { fetchRedis } from "@/helpers/redis";

function gerGoogleCredentials() {
    const googleClientId = process.env.GOOGLE_CLIENT_ID
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET

    if (!googleClientId || googleClientId.length === 0) {
        throw new Error("Missing Google client id")
    }

    if (!googleClientSecret || googleClientSecret.length === 0) {
        throw new Error("Missing Google client id")
    }

    return { googleClientId, googleClientSecret }
}

export const authOptions: NextAuthOptions = {
    adapter: UpstashRedisAdapter(db),
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login"
    },
    providers: [
        GoogleProvider({
            clientId: gerGoogleCredentials().googleClientId,
            clientSecret: gerGoogleCredentials().googleClientSecret,
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            const dbUserResult = await fetchRedis('get', `user:${token.id}`) as string | null

            if (!dbUserResult) {
                token.id = user!.id
                return token
            }

            const dbUser = JSON.parse(dbUserResult) as User

            return {
                id: dbUser.id,
                name: dbUser.name,
                email: dbUser.email,
                picture: dbUser.image, 
            }
        },
        async session({session, token}) { 
            if(token) {
                session.user.id = token.id
                session.user.name = token.name
                session.user.email = token.email
                session.user.image = token.picture 
            }
            return session
        },
        redirect() {
             return "/dashboard"
        }
    }
}