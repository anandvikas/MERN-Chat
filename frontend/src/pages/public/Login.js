import React, { useEffect, useState } from 'react'
import Button from '@mui/material/Button';
import { useForm } from "react-hook-form"
import FormGroup from '@mui/material/FormGroup';
import { useDispatch } from "react-redux"
import { Link } from "react-router-dom"
import { CommonInput, PasswordInput } from "../../components/Form/Form"
import { toast } from 'react-toastify';
import useRequest from "../../hooks/UseRequest"
import { setLogin } from "../../store/action"
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';



const Login = () => {
    const { handleSubmit, register, formState: { errors } } = useForm()
    const { request, response } = useRequest()
    const [introMsgOpen, setIntroMsgOpen] = useState(false)
    const dispatch = useDispatch()

    useEffect(() => {
        setTimeout(() => { setIntroMsgOpen(true) }, 2000)
    }, [])

    const submitForm = (data) => {
        request("POST", "/user/login", data)
    }

    useEffect(() => {
        if (response && response.status) {
            toast.success(response.message)
            dispatch(setLogin({
                user: response.user,
                token: response.token
            }));
        }
    }, [response])

    return (
        <div className='loginPage'>

            <div className="loginPageFormDiv">
                <form onSubmit={handleSubmit(submitForm)}>
                    <h2>Login</h2>
                    <FormGroup>
                        <CommonInput
                            name="loginId"
                            error={errors.loginId}
                            label="Username / Email"
                            type='text'
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
                            }}
                        />
                        <br />
                        <PasswordInput
                            name="password"
                            error={errors.password}
                            label="Password"
                            register={register}
                            registerFields={{
                                required: {
                                    value: true,
                                    message: 'this field is required'
                                }
                            }}
                        />
                        <br />
                        <Link className='forgetPassLink' to="/forget-password">Forget Password</Link>
                        <div className="loginBtnDiv">
                            <p className="infoText">don't have an account <Link className="fpLink" to="/signup">Register</Link></p>
                            <Button variant="contained" type='submit'>Login</Button>
                        </div>
                    </FormGroup>
                </form>
            </div>
            <Snackbar
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                open={introMsgOpen}
                onClose={() => { }}
                message={<div><i>Hello, My name is Vikas Anand.<br /><br />Welcome to this application.<br />
                    It is a chat application that I have made for learning purposes.<br />Although it is not a fully-fledged chat application,<br />but I am actively working to make it as good as I can.</i></div>}
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


export default Login
