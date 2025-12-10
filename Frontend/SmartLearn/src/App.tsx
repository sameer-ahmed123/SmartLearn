import Button from './components/UI/Button/Button'
import './App.css'
import Input from './components/UI/Input/Input'
import Card from './components/UI/Card/Card'
import React, { useState } from 'react'

function App() {
  const [email,setEmail] = useState("")

  const handeleEmailInput = (e:React.ChangeEvent<HTMLInputElement>)=>{
    setEmail(e.target.value)
    console.log(e.target.value)
  }

  return (
    <>
      
        <Input value={email} type='email'  placeholder='enter some thing ' label='random input' onChange={handeleEmailInput} name='email_input' required/>
        <Card className='my_container' >
          <Button  type='submit' variant='primary' onClick={()=> console.log("helloworld")} className='my_button'> hello world</Button>
        </Card>
    </>
  )
}

export default App
