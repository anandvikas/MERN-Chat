import React, { useEffect, useState } from 'react'
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux"
import { setLoading } from '../store/action';
import {PORT}  from "../constant/api"


import axios from "axios"
const server = PORT

const useRequest = () => {
    const [response, setResponse] = useState(null);
    const [loadingState, setLoadingState] = useState(false);
    const { token } = useSelector(state => state.generalReducer);
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(setLoading(loadingState))
    }, [loadingState])

    let extrasInHeader = {}
    if (token) {
        extrasInHeader.Authorization = `Bearer ${token}`
    }
    const request = (method, path, data, isLoaderHidden) => {
        let showLoader = !isLoaderHidden
        let url = `${server}${path}`
        let config = {
            method,
            url,
            headers: {
                ...extrasInHeader
            },
            data
        }
        if (showLoader) {
            setLoadingState(true);
        }
        axios(config)
            .then((res) => {
                setResponse(res.data);
                if (showLoader) {
                    setLoadingState(false);
                }

            })
            .catch((err) => {
                // console.log(err)
                toast.error(err?.response?.data?.message || "something went wrong");
                if (showLoader) {
                    setLoadingState(false);
                }
            })
    }
    return {
        request,
        response
    }
}

export default useRequest
