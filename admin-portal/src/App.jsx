import { createBrowserRouter, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Auth from "./pages/Auth.jsx";
import AdminDashboard from "./pages/Admin.jsx";
import { TicketList, TicketDetail } from "./pages/Tickets.jsx";

function RootRedirect() {
  return <Navigate to="/login" replace />;
}
export const router = createBrowserRouter([
  { path: "/", element: <RootRedirect /> },
  { path: "/login", element: <Auth /> },
  {
    element: <ProtectedRoute role="admin" />,
    children: [
      { path: "/admin", element: <AdminDashboard /> },
      { path: "/admin/tickets", element: <TicketList admin /> },
      { path: "/admin/tickets/:id", element: <TicketDetail admin /> },
    ],
  },
  { path: "*", element: <RootRedirect /> },
]);




import { useState } from 'react'
import './App.css'
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom"
import AuthPage from "./pages/auth/AuthPage"
import Profile from './pages/profile/Profile'
import ChatPage from './pages/chat/ChatPage'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'
import { setUserInfo } from './redux/slices/authSlice'

const PrivateRoute = ({children})=>{
  const user = useSelector((state)=> state.Auth.uservalue)
  const isAuthenticated =  !!user
  return isAuthenticated ? children : <Navigate to={"/auth"}/>
}

const AuthRoute = ({children})=>{
  const user = useSelector((state)=> state.Auth.uservalue)
  const isAuthenticated =  !!user
  return isAuthenticated ? <Navigate to={"/"}/> : children
}


function App() {
  const user = useSelector((state)=> state.Auth.uservalue)
  const dispatch = useDispatch()
  const [loading, setloading] = useState(true)
  const getUserData = async()=>{
      try {
        const res = await backend_url.get(`/user/userinfo`)
        if(res.status == 200 && res.data.id){
          dispatch(setUserInfo(res.data))
        }

      } catch (error) {
        dispatch(setUserInfo(undefined))
      } finally{
        setloading(false)
      }

    }
  useEffect(() => {
    if (!user) {
      getUserData()
    }

    else{
      setloading(false)
    }


  }, [user,setUserInfo])
  
  if(loading){
    return <div>Loading...</div>
  }

  return (
    <>
    <BrowserRouter>
     <Routes>
      <Route path='/*' element={<Navigate to={"/auth"}/>}/>
      <Route path='/auth' element={<AuthRoute> <AuthPage/></AuthRoute>}/>
      <Route path='/chat' element={<PrivateRoute><ChatPage/></PrivateRoute>}/>
      <Route path='/profile' element={<PrivateRoute><Profile/></PrivateRoute>}/>
     </Routes>
    </BrowserRouter>
    </>
  )
}

export default App;