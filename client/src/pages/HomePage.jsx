import React, { useContext, useState } from 'react'
import Sidebar from '../components/Sidebar'
import ChatContainer from '../components/ChatContainer'
import RightSidebar from '../components/RightSidebar'
import assets from '../assets/assets'
import { ChatContext } from '../../context/ChatContext'

const HomePage = () => {

  // Initially no user selected
  const {selectedUser} = useContext(ChatContext)

  
  return (

    <div className='relative w-full h-screen bg-black overflow-hidden flex items-center justify-center'>

      {/* Background */}
      <img
        src={assets.bg1}
        alt='background'
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      <div className="absolute inset-0 bg-black/70 z-10"></div>

      {/* Main Container */}
      <div
        className={`
        relative z-10 w-[90%] h-[90vh]
        backdrop-blur-md
        bg-white/5
        border border-white/30
        rounded-2xl
        overflow-hidden
        grid

        ${
          selectedUser
            ? 'md:grid-cols-[1fr_1.5fr_1fr]'
            : 'md:grid-cols-2'
        }
        `}
      >

        <Sidebar
        />

        <ChatContainer
        />

        {selectedUser && (
          <RightSidebar />
        )}

      </div>

    </div>
  )
}

export default HomePage