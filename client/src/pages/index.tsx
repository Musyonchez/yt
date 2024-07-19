import Hero from '@/components/Hero'
import Navbar from '@/components/Navbar'
import React from 'react'

const index = () => {
  return (
    <div className=' bg-purple-100 min-h-screen'>
      <Navbar />
      <Hero />
    </div>
  )
}

export default index