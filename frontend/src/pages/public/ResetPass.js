import React, { useEffect, useState } from 'react'
import Button from '@mui/material/Button';
import { useForm } from "react-hook-form"
import FormGroup from '@mui/material/FormGroup';
import { PasswordInput, CommonInput } from "../../components/Form/Form"
import { useParams, useNavigate } from 'react-router-dom';
import useRequest from '../../hooks/UseRequest';
import { toast } from "react-toastify";


const ResetPass = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const { handleSubmit, register, formState: { errors }, setError } = useForm()
    const [resError, setResError] = useState(null);
    const { request: tokenValidationReq, response: tokenValidationRes } = useRequest();
    const { request: resetPasswordReq, response: resetPasswordRes } = useRequest();


    useEffect(() => {
        if (!token) {
            navigate("/");
            return
        }
        tokenValidationReq("POST", "/user/validate-forget-password-token", { token })
    }, [])

    useEffect(() => {
        if (tokenValidationRes) {
            if (!tokenValidationRes.status) {
                navigate("/");
                return
            }
        }
    }, [tokenValidationRes])

    const submitForm = (data) => {
        if (data.password !== data.rPassword) {
            setError("rPassword", {
                type: "manual",
                message: "Repeat password do not match !"
            })
            return
        }
        resetPasswordReq("POST", "/user/reset-password", { token, password: data.password })
    }

    useEffect(() => {
        if (resetPasswordRes && resetPasswordRes.status) {
            toast.success(resetPasswordRes.message);
            navigate("/");
        }
    }, [resetPasswordRes])

    return (
        <div className='loginPage'>
            <div className="loginPageFormDiv">
                <form onSubmit={handleSubmit(submitForm)}>
                    <h2>Reset Password</h2>
                    <FormGroup>
                        <PasswordInput
                            label="New Password"
                            name="password"
                            registerFields={{
                                required: {
                                    value: true,
                                    message: 'New Password is required'
                                }
                            }}
                            error={errors.password}
                            register={register}
                        />
                        <br />
                        <PasswordInput
                            label="Repeat New Password"
                            name="rPassword"
                            registerFields={{
                                required: {
                                    value: true,
                                    message: 'Repeat New Password is required'
                                }
                            }}
                            error={errors.rPassword}
                            register={register}
                        />
                        <br />
                        <div className="loginBtnDiv">
                            <Button variant="contained" type='submit'>Submit</Button>
                        </div>
                    </FormGroup>
                </form>
            </div>
        </div>
    )
}

export default ResetPass
