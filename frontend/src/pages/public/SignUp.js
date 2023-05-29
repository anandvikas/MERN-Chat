import React, { useEffect, useState } from 'react'

import Button from '@mui/material/Button';
import { useForm } from "react-hook-form"

import { Link, useNavigate } from "react-router-dom"
import { CommonInput, PasswordInput } from "../../components/Form/Form"
import useRequest from "../../hooks/UseRequest"
import { toast } from "react-toastify";
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { PORT } from "../../constant/api"




const SignUp = () => {
    const { handleSubmit, register, formState: { errors }, setValue, watch } = useForm();

    const [avatars, setAvatars] = useState([]);
    const [avatarError, setAvatarError] = useState(false)
    const [selectedImage, setSelectedImage] = useState(null)
    const { request, response } = useRequest();
    const { request: avatarReq, response: avatarRes } = useRequest();
    const [introMsgOpen, setIntroMsgOpen] = useState(false)


    const navigate = useNavigate()

    useEffect(() => {
        avatarReq("GET", "/avatar");
        setTimeout(() => { setIntroMsgOpen(true) }, 2000);
    }, [])

    useEffect(() => {
        if (avatarRes) {
            setAvatars(avatarRes?.avatars)
        }
    }, [avatarRes])

    const submitForm = (data) => {
        if (!selectedImage) {
            setAvatarError(true)
            return;
        }

        request("POST", "/user/signup", { ...data, avatar: selectedImage })
    }

    useEffect(() => {
        if (response) {
            if (response.status) {
                toast.success(response.message)
                navigate(`/otp/${response.token}`)
            }
        }
    }, [response])

    return (
        <div className='loginPage'>
            <div className="loginPageFormDiv">
                <form onSubmit={handleSubmit(submitForm)}>
                    <h2>Create An Account</h2>
                    <CommonInput
                        error={errors.userName}
                        label="Username *"
                        type='text'
                        name="userName"
                        register={register}
                        registerFields={{
                            required: {
                                value: true,
                                message: 'this field is required'
                            },
                            minLength: {
                                value: 6,
                                message: 'Must contain atleast 6 charecters.'
                            },
                            maxLength: {
                                value: 15,
                                message: 'Cannot be more then 15 charecters.'
                            }
                        }}
                    />
                    <br />
                    <CommonInput
                        error={errors.email}
                        label="Email *"
                        type='email'
                        name="email"
                        register={register}
                        registerFields={{
                            required: {
                                value: true,
                                message: 'this field is required'
                            },
                            pattern: {
                                value: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
                                message: " Please provide a valid emeil address"
                            }
                        }}
                    />
                    <br />
                    <PasswordInput
                        name="password"
                        error={errors.password}
                        label="Password *"
                        register={register}
                        registerFields={{
                            required: {
                                value: true,
                                message: 'this field is required'
                            },
                            minLength: {
                                value: 8,
                                message: 'length of password must be 8 - 16 characters'
                            },
                            maxLength: {
                                value: 16,
                                message: 'length of password must be 8 - 16 characters'
                            },
                            pattern: {
                                value: /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,16}$/,
                                message: "Password must contain number, one lowercase letter, one uppercase letter, one special character and no space"
                            }
                        }}
                    />
                    <br />
                    <PasswordInput
                        name="rPassword"
                        error={errors.rPassword}
                        label="Repeat Password *"
                        register={register}
                        registerFields={{
                            required: {
                                value: true,
                                message: 'this field is required'
                            },
                            validate: (val) => {
                                if (watch('password') != val) {
                                    return "Passwords do no match";
                                }
                            },
                        }}
                    />
                    <div><center className={`avatarHeader ${avatarError ? "error" : ""}`}>Select an avatar *</center></div>
                    <div className='avatarContainer'>
                        {avatars.map((val) => {
                            return <div className='avatarDiv'><img className={selectedImage === val ? "selectedImage" : ""} onClick={() => { setSelectedImage(val); setAvatarError(false) }} src={`${PORT}/${val}`} alt="" /></div>
                        })}
                    </div>
                    <br />
                    <div className="loginBtnDiv">
                        <p className="infoText">Already have account <Link className="fpLink" to="/">LOGIN</Link></p>
                        <Button variant="contained" type='submit'>Sign Up</Button>
                    </div>
                </form>
            </div>
            <Snackbar
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                open={introMsgOpen}
                onClose={() => { }}
                message={<div><i>Hello, My name is Vikas Anand.<br />Since it is just a portfolio project,<br />I have set some limitations to prevent it from possible abuses.<br /><br />
                    - You cannot send more then 50 messages.<br />
                    - Your account will be automatically deleted after 15 days.<br />
                </i></div>}
                action={
                    <React.Fragment>
                        <IconButton
                            aria-label="close"
                            color="inherit"
                            sx={{ p: 0.5 }}
                            onClick={() => { setIntroMsgOpen(false) }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </React.Fragment>
                }
            />
        </div>
    )
}
export default SignUp
