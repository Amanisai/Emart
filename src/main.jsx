import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { CartProvider } from './stores/context/CartContext.jsx'
import { ThemeProvider } from './stores/context/ThemeContext.jsx'
import { ToastProvider } from './stores/context/ToastContext.jsx'
import { WishlistProvider } from './stores/context/WishlistContext.jsx'
import { AuthProvider } from './stores/context/AuthContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
<BrowserRouter>
  <React.StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  </React.StrictMode>,
</BrowserRouter>
)
