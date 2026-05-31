import Navbar from './components/Navbar'
import LandingPage from './pages/landing-page/LandingPage'
import {Routes, Route} from 'react-router-dom'
import SignUpPage from "./components/LoginPage.jsx";
import Footer from "./components/Footer.jsx";

const App= () => {

  return (
    <div className="min-h-screen">
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