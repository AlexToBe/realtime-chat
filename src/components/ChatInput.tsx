'use client'
import { FC, useRef, useState } from 'react'
import ReactTextareaAutosize from 'react-textarea-autosize'
import Button from './ui/Button'
import axios from 'axios'
import toast from 'react-hot-toast'

interface ChatInputProps{ 
    chatPartner: User
    chatId:string
}



const ChatInput: FC<ChatInputProps> = ({ chatPartner ,chatId }) => {
    const textareaRef = useRef<HTMLTextAreaElement|null>(null)
    const [input, setInput] = useState<string>('')
    
    const[isLoading,setIsloading] = useState<boolean>(false)

    const sendMessage = async() => {
        if (!textareaRef.current) return
        if (!input) return
        setIsloading(true)
        try {
        //    await new Promise((resolve) => setTimeout(resolve, 1000))
            await axios.post('/api/message/send', {
                chatId,
                text: input
            })
            setInput('')
            textareaRef.current?.focus()
       } catch (error) {
        toast.error('network condition went bad..'+error as string)
       }finally{
        setIsloading(false)
       }
    }
    return <div className=' border-t border-gray-200 px-4 pt-4 mb-2 sm:mb-0' >
        <div className=' relative flex-1 overflow-hidden rounded-lg shadow-sm ring-1 ring-inset ring-gray-300
         focus-within:ring-2 focus-within:ring-indigo-600' >
            <ReactTextareaAutosize ref={textareaRef}
                onKeyDown={(e) => {
                    if (e.key === 'Enter'&&!e.shiftKey) {
                        e.preventDefault()
                        sendMessage()
                    }
                }}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className=' block w-full resize-none border-0 bg-transparent 
                 placeholder:text-gray-400 text-gray-900 focus:ring-0  sm:py-1.5 sm:text-sm sm:leading-6'
                placeholder={ `Message${chatPartner.name}`}
            />
            <div onClick={() => textareaRef.current?.focus()}
                className=' py2'
                aria-hidden='true'>
                <div className=' py-px'></div>
                <div className=' h-9'/>
            </div>
            <div className=' absolute right-0 bottom-0 flex justify-between py-2 pl-3 pr-2' >
                <div>
                    <Button isLoading={isLoading} onClick={sendMessage} type='submit'>Post</Button>
                </div>
            </div>
         </div>
    </div>


}

export default ChatInput