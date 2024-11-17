import { SignUp } from '@clerk/clerk-react'
import React from 'react'

const Register = () => {
  return (
    <div className='bg-red-500 flex justify-center items-center'>
      <SignUp />
    </div>
  )
}

export default Register