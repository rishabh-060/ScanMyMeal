'use client'
import BacktoHome from '@/Components/BacktoHome'
import RestrictUser from '@/Components/RestrictUser'
import UserMenu from '@/Components/userMenu'
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'

const layout = ({children}) => {
  const user = useSelector((state) => state.user)
  useEffect(() => {
    // if user is not logged in, redirect to login page
    if (!user) {
        <RestrictUser/>
    }
  }, [])

  return (
    <section className='max-w-full min-h-[65vh] lg:min-h-[68vh] lg:m-2 px-4'>
        <div className='container mx-auto grid lg:grid-cols-[250px_1fr] gap-4'>
            <aside className='sticky top-0 px-4 overflow-y-auto bg-neutral-100 hidden lg:block py-2 border-r border-neutral-300'>
                <BacktoHome />
                <UserMenu />
            </aside>

            {React.Children.map(children, (child) => (
                <main className="p-4 bg-neutral-100 ">
                    {children}
                </main>
            ))}
        </div>
    </section>
  )
}

export default layout