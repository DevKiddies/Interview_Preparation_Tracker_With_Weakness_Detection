import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'  // 👈 add
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="1057604922832-m1sepbmtvhg7ht6rqndqo0gvqgos2dkd.apps.googleusercontent.com">  {/* 👈 wrap */}
      <BrowserRouter>
        <App/>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>,
)