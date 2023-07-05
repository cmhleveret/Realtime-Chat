import ChatInput from "@/components/ChatInput";
import Messages from "@/components/ui/Messages";
import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { messageArrayValidator } from "@/lib/validations/messages";
import { getServerSession } from "next-auth";
import Image from "next/image";
import { notFound } from "next/navigation";
import { FC } from "react";

interface pageProps {
    params: {
        chatid: string
    }
}

async function getChatMessages(chatId: string) {
  try {

    const results: string[] = await fetchRedis(
      'zrange',
      `chat:${chatId}:messages`,
      0,
      -1
    )
    console.log("one")
    console.log(results)

    const dbMessages = results.map((message) => JSON.parse(message) as Message)

    console.log("two")
    console.log(dbMessages)

    const reversedDbMessages = dbMessages.reverse()

    console.log("three")
    console.log(reversedDbMessages)

     const messages = messageArrayValidator.parse(reversedDbMessages)
    // const messages = [{
      
    //     "id": "bfeeM43NZowBYVaqEK9Rm",
    //     "senderId": "d3ffbf59-756e-40f9-b2aa-607e73675227",
    //     "text": "gello",
    //     "timestamp": 1688390587710
      
    // }]

console.log("messages")



    return messages
  } catch (error) {
    console.log(error)
    notFound()
    
  }
}

const Chat = async ({params}: pageProps) => {
    const { chatid } = params
    const session = await getServerSession(authOptions)
    if(!session) notFound()

    const {user} = session

    const [userId1, userId2] = chatid.split('--')

    if(user.id !== userId1 && user.id !== userId2) {
        notFound()
    }

    const chatPartnerId = user.id === userId1 ? userId2 : userId1
    const chatPartner = (await db.get(`user:${chatPartnerId}`)) as User
    // const initialMessages = await getChatMessages(chatid)
    const initialMessages = await getChatMessages(chatid)
    console.log("initialMessages second")
    console.log(initialMessages)

    return (

        <div className='flex-1 justify-between flex flex-col h-full max-h-[calc(100vh-6rem)]'>
               <div className='flex sm:items-center justify-between py-3 border-b-2 border-gray-200'>
                <div className='relative flex items-center space-x-4'>
                   <div className='relative'>
                     <div className='relative w-8 sm:w-12 h-8 sm:h-12'>
                   
                      <Image
                        fill
                        referrerPolicy='no-referrer'
                        src={chatPartner.image}
                        alt={`${chatPartner.name} profile picture`}
                        className='rounded-full'
                      />
                    </div>
                  </div>
        
                  <div className='flex flex-col leading-tight'>
                    <div className='text-xl flex items-center'>
                      <span className='text-gray-700 mr-3 font-semibold'>
                        {chatPartner.name}
                      </span>
                    </div>
        
                    <span className='text-sm text-gray-600'>{chatPartner.email}</span>
                  </div>
                </div>
              </div>
        
        
               <Messages
                chatId={chatid}
                chatPartner={chatPartner}
                sessionImg={session.user.image}
                sessionId={session.user.id}
                initialMessages={initialMessages}
              />  

          
              <ChatInput chatId={chatid} chatPartner={chatPartner} />
            </div>
    )
}

export default Chat;

// import ChatInput from '@/components/ChatInput'
// import { fetchRedis } from '@/helpers/redis'
// import { authOptions } from '@/lib/auth'
// import { messageArrayValidator } from '@/lib/validations/messages'
// import { getServerSession } from 'next-auth'
// import Image from 'next/image'
// import { notFound } from 'next/navigation'

// The following generateMetadata functiion was written after the video and is purely optional
// export async function generateMetadata({
//   params,
// }: {
//   params: { chatId: string }
// }) {
//   const session = await getServerSession(authOptions)
//   if (!session) notFound()
//   const [userId1, userId2] = params.chatId.split('--')
//   const { user } = session

//   const chatPartnerId = user.id === userId1 ? userId2 : userId1
//   const chatPartnerRaw = (await fetchRedis(
//     'get',
//     `user:${chatPartnerId}`
//   )) as string
//   const chatPartner = JSON.parse(chatPartnerRaw) as User

//   return { title: `FriendZone | ${chatPartner.name} chat` }
// }

// interface PageProps {
//   params: {
//     chatId: string
//   }
// }

// async function getChatMessages(chatId: string) {
//   try {
//     const results: string[] = await fetchRedis(
//       'zrange',
//       `chat:${chatId}:messages`,
//       0,
//       -1
//     )

//     const dbMessages = results.map((message) => JSON.parse(message) as Message)

//     const reversedDbMessages = dbMessages.reverse()

//     const messages = messageArrayValidator.parse(reversedDbMessages)

//     return messages
//   } catch (error) {
//     notFound()
//   }
// }

// const Chat = async ({ params }: PageProps) => {
//   const { chatId } = params
//   const session = await getServerSession(authOptions)
//   if (!session) notFound()

//   const { user } = session

//   const [userId1, userId2] = chatId.split('--')

//   if (user.id !== userId1 && user.id !== userId2) {
//     notFound()
//   }

//   const chatPartnerId = user.id === userId1 ? userId2 : userId1
//   // new

//   const chatPartnerRaw = (await fetchRedis(
//     'get',
//     `user:${chatPartnerId}`
//   )) as string
//   const chatPartner = JSON.parse(chatPartnerRaw) as User
//   const initialMessages = await getChatMessages(chatId)

//   return (
//     <div className='flex-1 justify-between flex flex-col h-full max-h-[calc(100vh-6rem)]'>
//       <div className='flex sm:items-center justify-between py-3 border-b-2 border-gray-200'>
//         <div className='relative flex items-center space-x-4'>
//           <div className='relative'>
//             <div className='relative w-8 sm:w-12 h-8 sm:h-12'>
//               <Image
//                 fill
//                 referrerPolicy='no-referrer'
//                 src={chatPartner.image}
//                 alt={`${chatPartner.name} profile picture`}
//                 className='rounded-full'
//               />
//             </div>
//           </div>

//           <div className='flex flex-col leading-tight'>
//             <div className='text-xl flex items-center'>
//               <span className='text-gray-700 mr-3 font-semibold'>
//                 {chatPartner.name}
//               </span>
//             </div>

//             <span className='text-sm text-gray-600'>{chatPartner.email}</span>
//           </div>
//         </div>
//       </div>

//       {/* <Messages
//         chatId={chatId}
//         chatPartner={chatPartner}
//         sessionImg={session.user.image}
//         sessionId={session.user.id}
//         initialMessages={initialMessages}
//       /> */}
//       <ChatInput chatId={chatId} chatPartner={chatPartner} />
//     </div>
//   )
// }

// export default Chat
