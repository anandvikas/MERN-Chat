import React from 'react'
import { Routes, Route } from "react-router-dom"


//public ---------------------------------------
import SignUp from "../pages/public/SignUp"
import Login from "../pages/public/Login"
import Otp from "../pages/public/Otp"
import ForgotPass from "../pages/public/ForgotPass"
import ResetPass from "../pages/public/ResetPass"

//private -------------------------------------------
import Dashboard from "../pages/private/Dashboard"


export const privateRoutes = [
    { path: "/", component: Dashboard }    
]

export const publicRoutes = [
    { path: "/", component: Login },
    { path: "/signup", component: SignUp },
    { path: "/forget-password", component: ForgotPass },
    { path: "/otp/:token", component: Otp },
    { path: "/reset-password/:token", component: ResetPass },
]

export const ProtectedRoutes = () => {
    return (
        <Routes>
            {
                privateRoutes.map((val, index) => <Route key={index} path={val.path} element={<val.component />} />)
            }
        </Routes>
    )
}

export const NonProtectedRoutes = () => {
    return (
        <Routes>
            {
                publicRoutes.map((val, index) => <Route key={index} path={val.path} element={<val.component />} />)
            }
        </Routes>
    )
}

