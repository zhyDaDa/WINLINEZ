import { useState } from 'react'
import Main from './pages/main'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Main></Main>
    </>
  )
}

export default App
