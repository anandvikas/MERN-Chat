import React, { useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { io } from "socket.io-client";
import { setSocket, addMessage, setArrivedNewMessages, setMyChats, removeArrivedNewMessages, setActiveChatMessages, setActiveChatNewMessages, setNewSeenMarkedMessages, setNewReceivedMarkedMessages, setTyping, setIsPartnerTyping } from '../store/action';
import { PORT } from "../constant/api"



const useSocket = () => {
    const dispatch = useDispatch();
    const { user, socket, token, activeChat, myChats, arrivedNewMessages, activeChatMessages, activeChatNewMessages, newSeenMarkedMessages, newReceivedMarkedMessages } = useSelector(store => store.generalReducer);

    const chatReplyHandler = (data) => {
        const { chatId, message } = data;
        if (!chatId || !message) { return };
        dispatch(setActiveChatNewMessages({ chatId, message }));
    }

    const newMessageHandler = (data) => {
        const { chatId, message } = data;
        if (!chatId || !message) { return };
        dispatch(setArrivedNewMessages({
            chatId,
            ...message,
        }))
    }

    const seenStatusHandler = (data) => {
        const { messages, chatId } = data;
        if (!chatId || !messages || messages.length < 1) {
            return
        }
        dispatch(setNewSeenMarkedMessages(messages))
    }

    const receivedStatusHandler = (data) => {
        const { messages, chatId } = data;
        if (!chatId || !messages || messages.length < 1) {
            return
        }
        dispatch(setNewReceivedMarkedMessages(messages))
    }

    const typingHandler = useCallback((data) => {
        const { chatId } = data;
        dispatch(setIsPartnerTyping(true));
        setTimeout(() => {
            dispatch(setIsPartnerTyping(false));
        }, 1000)
    }, [activeChat])


    useEffect(() => {
        if (arrivedNewMessages.length > 0) {
            let updatedChats = myChats.map(elem => {
                let newUnseenMessagesCount = +elem.unseenMessagesCount
                let newUnseenMessages = elem.unseenMessages
                let newlastMessage = elem.lastMessage
                arrivedNewMessages.forEach(nm => {
                    if (nm.chatId === elem._id) {
                        if (activeChat !== nm.chatId && nm.sender._id !== user._id) {
                            newUnseenMessagesCount = newUnseenMessagesCount + 1;
                            newUnseenMessages = [...newUnseenMessages, { _id: nm._id }];
                        }
                        newlastMessage = nm
                    }
                })
                return {
                    ...elem,
                    unseenMessagesCount: newUnseenMessagesCount,
                    unseenMessages: newUnseenMessages,
                    lastMessage: newlastMessage
                }
            })
            dispatch(setMyChats(updatedChats))
            dispatch(removeArrivedNewMessages())
        }
    }, [arrivedNewMessages])

    useEffect(() => {
        if (activeChatNewMessages.chatId === activeChat) {
            dispatch(setActiveChatMessages([...activeChatMessages, activeChatNewMessages.message]))
        }
    }, [activeChatNewMessages])

    useEffect(() => {
        if (newSeenMarkedMessages.length > 0) {
            let updatedChatMessages = activeChatMessages.map(val => {
                if (newSeenMarkedMessages.includes(val._id)) {
                    return {
                        ...val,
                        status: "seen"
                    }
                } else {
                    return val
                }
            })
            dispatch(setActiveChatMessages(updatedChatMessages))

            let updatedChat = myChats.map(val => {
                if (newSeenMarkedMessages.includes(val.lastMessage._id)) {
                    return {
                        ...val,
                        lastMessage: {
                            ...val.lastMessage,
                            status: 'seen'
                        }
                    }
                } else {
                    return val
                }
            })
            dispatch(setMyChats(updatedChat))
        }
    }, [newSeenMarkedMessages])

    useEffect(() => {
        if (newReceivedMarkedMessages.length > 0) {
            let updatedChatMessages = activeChatMessages.map(val => {
                if (newReceivedMarkedMessages.includes(val._id)) {
                    return {
                        ...val,
                        status: "received"
                    }
                } else {
                    return val
                }
            })
            dispatch(setActiveChatMessages(updatedChatMessages))

            let updatedChat = myChats.map(val => {
                if (newReceivedMarkedMessages.includes(val.lastMessage._id)) {
                    return {
                        ...val,
                        lastMessage: {
                            ...val.lastMessage,
                            status: 'received'
                        }
                    }
                } else {
                    return val
                }
            })
            dispatch(setMyChats(updatedChat))
        }
    }, [newReceivedMarkedMessages])

    useEffect(() => {
        if (socket) {
            socket.emit('join', { token })
            socket.on("chatReply", chatReplyHandler);
            socket.on("newMessage", newMessageHandler);
            socket.on("receivedStatus", receivedStatusHandler);
            socket.on("seenStatus", seenStatusHandler);
            socket.on("typing", typingHandler);

            return () => {
                socket.off("chatReply", chatReplyHandler);
                socket.off("chatReply", newMessageHandler);
                socket.off("newMessage", newMessageHandler);
                socket.off("receivedStatus", receivedStatusHandler);
                socket.off("seenStatus", seenStatusHandler);
                socket.on("typing", typingHandler);
            };
        }
    }, [socket])


    const initialise = () => {
        dispatch(
            setSocket(
                io(PORT, { transports: ["websocket"] })
            )
        );
    }
    return {
        initialise,
    }
}

export default useSocket;