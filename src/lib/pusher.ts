import PusherServer from 'pusher'
import PusherClient from 'pusher-js'

export const pushServer = new PusherServer({
  appId: process.env.PUSH_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSH_APP_KEY!,
  secret: process.env.PUSH_APP_SECRET!,
  cluster: 'ap1',
  useTLS: true,
})

export const pushClient = new PusherClient(process.env.NEXT_PUBLIC_PUSH_APP_KEY!, {
  cluster: 'ap1',
//   forceTLS: true,
})