import React from 'react'
import { SignIn } from '@clerk/clerk-react'

const Login = () => {
  return (
    <div className='bg-[#ff7f50] w-full h-screen flex justify-center items-center'>
      <SignIn />
    </div>
  )
}

export default Login