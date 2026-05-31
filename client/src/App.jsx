import Navbar from './components/Navbar'
import LandingPage from './pages/LandingPage.jsx'
import {Routes, Route} from 'react-router-dom'
import SignUpPage from "./pages/LoginPage.jsx";
import Footer from "./components/Footer.jsx";

const App= () => {

  return (
    <div className="flex min-h-screen flex-col">
        <Navbar/>
        <Routes>
            <Route path="/" element={<> <LandingPage/></>} />
            <Route path="/signup" element={<><SignUpPage/></>} />
        </Routes>
        <Footer />
    </div>
  )
}
export default App