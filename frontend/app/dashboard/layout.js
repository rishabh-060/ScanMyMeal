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
    <section className="max-w-full min-h-[65vh] lg:min-h-[68vh] lg:m-2 px-4">
      <div className="container mx-auto grid lg:grid-cols-[260px_1fr] gap-6">
        
        {/* Sidebar */}
        <aside className="sticky top-4 px-4 overflow-y-auto hidden lg:block py-4 rounded-xl 
          bg-white/80 backdrop-blur-md border border-neutral-200 shadow-lg 
          max-h-[90vh] scrollbar-thin scrollbar-thumb-amber-400 scrollbar-track-transparent">
          
          <div className="mb-6">
            <BacktoHome />
          </div>

          <div className="space-y-4">
            <UserMenu />
          </div>
        </aside>

        {/* Main Content */}
        <main className="p-6 bg-white/60 backdrop-blur-lg rounded-xl shadow-md border border-neutral-200">
          {React.Children.map(children, (child) => child)}
        </main>

      </div>
    </section>
  )
}

export default layout