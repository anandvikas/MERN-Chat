import React, { useEffect, useState } from 'react'
import Button from '@mui/material/Button';
import { useForm } from "react-hook-form"
import { useDispatch, useSelector } from "react-redux"
import { CommonInput } from "../Form/Form"
import { toast } from 'react-toastify';
import useRequest from "../../hooks/UseRequest"
import { updateProfile } from "../../store/action"
import { PORT } from "../../constant/api"

const AccountSetting = () => {
    const { handleSubmit, register, formState: { errors }, setValue } = useForm();
    const { user } = useSelector(store => store.generalReducer);
    const dispatch = useDispatch()
    const [avatars, setAvatars] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null)
    const { request, response } = useRequest();
    const { request: avatarReq, response: avatarRes } = useRequest();


    useEffect(() => {
        avatarReq("GET", "/avatar");
        setValue('userName', user?.userName || "");
        setSelectedImage(user?.avatar || null)
    }, [])

    useEffect(() => {
        if (avatarRes) {
            setAvatars(avatarRes?.avatars)
        }
    }, [avatarRes])

    const submitForm = (data) => {
        request("POST", "/user/update-profile", { ...data, avatar: selectedImage })
    }

    useEffect(() => {
        if (response && response.status) {
            toast.success(response.message)
            dispatch(updateProfile(response?.updated || {}))
        }
    }, [response])

    return (
        <>
            <div className="content_container">
                <div className="acc_setting_div">
                    <form onSubmit={handleSubmit(submitForm)}>
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
                        <div className='avatarContainer'>
                            {avatars.map((val) => {
                                return <div className='avatarDiv'><img className={selectedImage === val ? "selectedImage" : ""} onClick={() => { setSelectedImage(val) }} src={`${PORT}/${val}`} alt="" /></div>
                            })}
                        </div>
                        <br />
                        <center><Button variant="contained" type='submit'>Update</Button></center>
                    </form>
                </div>
            </div>
        </>
    )
}


export default AccountSetting
