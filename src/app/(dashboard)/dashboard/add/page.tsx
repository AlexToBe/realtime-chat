import AddFriendButton from '@/components/ui/AddFriendButton'
import {FC} from 'react'


const Page: FC =  () => {
    return <main className=' pt-8'>
            <h1 className=' font-bold text-5xl mb-8'>
                Add a friend
                <AddFriendButton></AddFriendButton>
            </h1>
         </main>


}

export default Page