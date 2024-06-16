'use client'

import Button from '@/components/ui/Button'
import { signIn } from 'next-auth/react'
import {FC, useState} from 'react'
import toast from 'react-hot-toast'

interface pageProps{ }

const Page: FC<pageProps> = ({ }) => {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    async function loginWithGithub() {
        setIsLoading(true)
        try {
            await signIn('github')
        } catch (error) {
            toast.error('Something went wrong with your login')
        } finally {
            setIsLoading(false)
        }
    }

    return <>
        <div className=' flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8' >
            <div className=' w-full flex flex-col items-center max-w-md space-y-8' >
                <div className=' flex flex-col items-center gap-8'>
                    logo
                    <h2 className=' m-6 text-center text-3xl font-bold tracking-tighter text-gray-900'> Sign in to your account</h2>
                </div>
                <Button
                    isLoading={isLoading} type='button'
                    className=' max-w-sm mx-auto w-full'
                    onClick={loginWithGithub}>
                    {isLoading?'loading...':null}
                    Github
                </Button>
            </div>
        </div>
    </>

}

export default Page