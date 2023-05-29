import React, { useEffect, useState } from 'react'
import Button from '@mui/material/Button';
import { useForm } from "react-hook-form"
import { useParams, useNavigate } from 'react-router-dom';
import useRequest from '../../hooks/UseRequest';
import { useDispatch } from "react-redux"
import { setLogin } from "../../store/action"
import { toast } from 'react-toastify';



const Otp = () => {
    const dispatch = useDispatch()
    const { token } = useParams();
    const navigete = useNavigate();
    const { request: validateTokenReq, response: validateTokenRes } = useRequest();
    const { request: resendOtpReq, response: resendOtpRes } = useRequest();
    const { request: validateOtpReq, response: validateOtpRes } = useRequest();
    const { handleSubmit, register, formState: { errors } } = useForm();
    const [resendBtnVisible, setResendBtnVisible] = useState(false);
    const [timer, setTimer] = useState(60);
    const [email, setEmail] = useState(null);

    useEffect(() => {
        if (!token) {
            navigete("/")
        }
        validateTokenReq("POST", "/user/validate-token", { token })
    }, [])

    useEffect(() => {
        if (validateTokenRes) {
            if (validateTokenRes.status) {
                setEmail(validateTokenRes.email)
            } else {
                navigete("/")
            }
        }
    }, [validateTokenRes]);

    const resendOtp = () => {
        resendOtpReq("POST", "/user/resend-otp", { token });
    }

    useEffect(() => {
        if (resendOtpRes && resendOtpRes.status) {
            toast.success(resendOtpRes.message);
            setTimer(60);
            setResendBtnVisible(false);
        }
    }, [resendOtpRes]);

    const submitForm = (data) => {
        let otp = `${data.num1}${data.num2}${data.num3}${data.num4}`
        validateOtpReq("POST", "/user/verify-email", { otp, token })
    }

    useEffect(() => {
        if (validateOtpRes && validateOtpRes.status) {
            toast.success(validateOtpRes.message);
            dispatch(setLogin({
                user: validateOtpRes.user,
                token: validateOtpRes.token
            }))
            navigete("/")
        }
    }, [validateOtpRes]);

    useEffect(() => {
        if (timer <= 0) {
            setResendBtnVisible(true);
            return
        }
        setTimeout(() => {
            setTimer(prev => prev - 1)
        }, 1000);
    }, [timer])

    const setIndex = (e) => {
        let currentIndex = e.target.tabIndex
        if (e.key === "Backspace" || e.key === "Delete") {
            if (currentIndex === 0) {
                return
            }
            e.target.form[currentIndex - 1].focus()
            return
        }
        if (currentIndex === 3) {
            return
        }
        e.target.form[currentIndex + 1].focus()
    }



    return (
        <div className='loginPage'>
            <div className="loginPageFormDiv">
                <form onSubmit={handleSubmit(submitForm)}>
                    <h2>Enter The OTP</h2>
                    {email && <p className="infoText">Send to {email}</p>}
                    <div className="otpGroup">
                        <input
                            className="otpInput"
                            type='text'
                            tabIndex="0"
                            maxLength="1"
                            onKeyUp={setIndex}
                            {...register("num1", {
                                required: true,
                            })}
                        />
                        <input
                            className="otpInput"
                            type='text'
                            tabIndex="1"
                            maxLength="1"
                            onKeyUp={setIndex}
                            {...register("num2", {
                                required: true,
                            })}
                        />
                        <input
                            className="otpInput"
                            type='text'
                            tabIndex="2"
                            maxLength="1"
                            onKeyUp={setIndex}
                            {...register("num3", {
                                required: true,
                            })}
                        />
                        <input
                            className="otpInput"
                            type='text'
                            tabIndex="3"
                            maxLength="1"
                            onKeyUp={setIndex}
                            {...register("num4", {
                                required: true,
                            })}
                        />
                    </div>

                    <div className="loginBtnDiv">
                        {
                            resendBtnVisible ? <Button variant="outlined" type='button' onClick={resendOtp}>Resend OTP</Button> : <span>{timer}</span>
                        }
                        <Button variant="contained" type='submit'>Submit</Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Otp
