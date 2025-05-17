import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {BrowserRouter as Router,Routes,Route} from 'react-router'
import MintLand from './components/MintLand.jsx'
import AddTrustedMember from './components/AddTrustedMember.jsx'
import TransferLand from './components/TransferLand.jsx'
import Navbar from './components/Navbar.jsx'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Navbar/>
      <App/>
    </Router>
  </StrictMode>,
)
