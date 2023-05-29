import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setActiveChat, setActiveMainComponent, setChatData } from "../../store/action";
import Button from '@mui/material/Button';
import useRequest from "../../hooks/UseRequest"
import { toast } from 'react-toastify';



const StartConvo = () => {
    const { chatData, socket } = useSelector(store => store.generalReducer);
    const dispatch = useDispatch();
    const { request: startChatReq, response: startChatRes } = useRequest();

    const handleStart = () => {
        startChatReq("POST", "/chat/create", { otherUserId: chatData.otherUser._id })
    }

    useEffect(() => {
        if (startChatRes && startChatRes.status) {
            toast.success(startChatRes.message);
            dispatch(setActiveChat(startChatRes.chatId));
            dispatch(setChatData({
                lastMessage: startChatRes.lastMessage
            }));
            dispatch(setActiveMainComponent("messages"))
            socket?.emit('setActiveChat', { chatId: startChatRes.chatId });
        }
    }, [startChatRes])

    return (
        <div className="content_container">
            <div className="welcome_div">
                <div>Start Conversation</div>
                <div>
                    <Button sx={{ px: 5, py: 2, fontSize: 20 }} onClick={handleStart} variant="contained" type='submit'>Start</Button>
                </div>
            </div>
        </div>
    );
};

export default StartConvo;
