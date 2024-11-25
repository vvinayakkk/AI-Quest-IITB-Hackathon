import React from 'react'
import { SignIn } from '@clerk/clerk-react'

const Login = () => {
  return (
    <div className='bg-primary h-screen flex justify-center items-center'>
      <SignIn afterSignInUrl='/home'/>
    </div>
  )
}

export default Login