import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import React from 'react'
import { Outlet } from 'react-router-dom'

const MainLayout = () => {
  return (
    <div>
      <Navbar />
      <Sidebar />
      <Outlet />
    </div>
  )
}

export default MainLayout