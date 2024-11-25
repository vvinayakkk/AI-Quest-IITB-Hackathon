import { SignUp } from '@clerk/clerk-react'
import React from 'react'

const Register = () => {
  return (
    <div className='bg-primary h-screen flex justify-center items-center'>
      <SignUp />
    </div>
  )
}

export default Register