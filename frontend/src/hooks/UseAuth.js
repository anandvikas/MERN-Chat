import { useDispatch } from "react-redux"
import { useEffect } from "react";
import useRequest from "./UseRequest"
import { setLogin } from "../store/action"


const useAuth = () => {
    const { request, response } = useRequest()
    const dispatch = useDispatch()

    useEffect(() => {
        let auth = JSON.parse(localStorage.getItem('auth'))
        if (auth) {
            request("POST", "/user/validate-auth", { token: auth })
        }
    }, [])

    useEffect(() => {
        if (response) {
            if (response.status) {
                dispatch(setLogin({
                    user: response.user,
                    token: response.token
                }))
            } else {
                localStorage.removeItem('auth')
            }
        }
    }, [response])
}

export default useAuth;