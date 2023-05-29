import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import { useForm } from "react-hook-form"
import FormGroup from '@mui/material/FormGroup';
import { CommonInput } from "../../components/Form/Form"
import useRequest from '../../hooks/UseRequest';
import { toast } from "react-toastify";


const ForgotPass = () => {
    const navigate = useNavigate()
    const { handleSubmit, register, formState: { errors }, setValue } = useForm();
    const {request : forgetPassReq, response : forgetPassRes} = useRequest();
    const submitForm = (data) => {
        forgetPassReq("POST", "/user/forget-password", data)
    }

    useEffect(() => {
        if(forgetPassRes && forgetPassRes.status){
            toast.success(forgetPassRes.message);
            setValue('email', "")
        }
    },[forgetPassRes])
    return (
        <div className='loginPage'>
            <div className="loginPageFormDiv">
                <form onSubmit={handleSubmit(submitForm)}>
                    <h2>Forgot Password</h2>
                    <FormGroup>
                        <CommonInput
                            name="email"
                            label="Registered Email Id"
                            type="text"
                            register={register}
                            error={errors.email}
                            registerFields={{
                                required: {
                                    value: true,
                                    message: "Registered Email Id is required"
                                },
                                pattern: {
                                    value: /^[a-z0-9][a-z0-9-_\.]+@([a-z]|[a-z0-9]?[a-z0-9-]+[a-z0-9])\.[a-z0-9]{2,10}(?:\.[a-z]{2,10})?$/,
                                    message: 'Please enter a valid email address'
                                }
                            }}
                        />
                        <br />
                        <div className="loginBtnDiv">
                            <Button variant="outlined" type='button' onClick={() => navigate("/")}>Back</Button>
                            <Button variant="contained" type='submit'>Next</Button>
                        </div>
                    </FormGroup>
                </form>
            </div>
        </div>
    )
}

export default ForgotPass
