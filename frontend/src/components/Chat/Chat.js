import React, { useEffect, useRef, useState } from "react";
import SendIcon from "@mui/icons-material/Send";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import AttachmentIcon from "@mui/icons-material/Attachment";
import EmojiPicker from "emoji-picker-react";
import Button from '@mui/material/Button';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { useDispatch, useSelector } from "react-redux"
import { setActiveChatMessages, setMyChats } from "../../store/action";
import sentImag from "../../media/sent.png";
import receivedImag from "../../media/received.png";
import seenImag from "../../media/seen.png";
import attachment from "../../media/attachment.jpg";
import CloseIcon from '@mui/icons-material/Close';
import TypingLoader from "../Loader/TypingLoader";
import useRequest from "../../hooks/UseRequest"
import { toast } from "react-toastify";
import moment from 'moment'
import Tooltip from '@mui/material/Tooltip';
import { makeLongStringShort } from "../../utils/helper";
import {PORT}  from "../../constant/api"




const Chat = () => {
    const { activeChat, user, activeChatMessages, myChats } = useSelector(store => store.generalReducer);
    const dispatch = useDispatch();

    const [msgSelectedForAction, setMsgSelectedForAction] = useState(null);
    const [replyOf, setReplyOf] = useState(null);
    const [nextPage, setNextPage] = useState(1);
    const { request: getMessagesReq, response: getMessagesRes } = useRequest();
    const [newestMessage, setNewestMessage] = useState(null);

    useEffect(() => {
        if (activeChat) {
            dispatch(setActiveChatMessages([]))
            setMsgSelectedForAction(null);
            setReplyOf(null);
            setNextPage(1);
            getMessagesReq("POST", `/chat/chat-messages?page=1`, { chatId: activeChat }, true)
        }
    }, [activeChat])

    useEffect(() => {
        if (getMessagesRes && getMessagesRes.status) {
            dispatch(setActiveChatMessages([...getMessagesRes.messages, ...activeChatMessages]))
            setNextPage(getMessagesRes.nextPage);

            // if message f fetched by user , it means it is seen by user, so reducing unseen messages
            let fetchedMsgIds = getMessagesRes.messages.map(m => m._id)
            let updatedMyChats = myChats.map(mc => {
                return {
                    ...mc,
                    unseenMessages: mc.unseenMessages.filter(um => !fetchedMsgIds.includes(um._id))
                }
            })
            dispatch(setMyChats(updatedMyChats))
            // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
        }
    }, [getMessagesRes])


    const handleMsgAction = (msg) => {
        setMsgSelectedForAction(msg);
    };

    const handleReply = () => {
        setReplyOf(msgSelectedForAction);
        setMsgSelectedForAction(null)
    }

    const handleScroll = (e) => {
        if (e.target.scrollTop === 0 && nextPage > 1) {
            getMessagesReq("POST", `/chat/chat-messages?page=${nextPage}`, { chatId: activeChat })
        }
    }

    useEffect(() => {
        if (activeChatMessages.length < 1) { return }
        setNewestMessage(activeChatMessages[activeChatMessages.length - 1]?._id || null)
    }, [activeChatMessages])

    useEffect(() => {
        if (newestMessage) {
            // console.log(newestMessage)
            let msgDiv = document.getElementById(newestMessage)
            const topPosition = msgDiv?.offsetTop;
            document.getElementById("messages_container").scrollTop = topPosition;
        }
    }, [newestMessage])


    return (
        <div className="content_container">
            <div className="messages_container" id="messages_container" onScroll={handleScroll}>
                {
                    activeChatMessages.map(message => {
                        let me = user;
                        let sender = message.sender;
                        let iAmSender = me._id === sender._id;
                        return (
                            <div key={message._id} className={`message ${iAmSender ? "firstperson" : "secondperson"}`}>
                                <div id={message._id} className="message_data">
                                    <div className="message_sender">
                                        {/* {iAmSender ? "__" : sender.userName} */}
                                        {sender.userName}
                                        <div className="msg_actions" onClick={() => { handleMsgAction(message) }}>
                                            <MoreHorizIcon />
                                        </div>
                                    </div>
                                    {
                                        message.replyOf &&
                                        <div className="message_quote">{message.replyOf.file !== null ? <i>File attachment ...</i> : message.replyOf.text}</div>
                                    }
                                    {
                                        message.file !== null &&
                                        <div className="message_attachment">
                                            <img src={`${PORT}/${message.file}`} alt="" />
                                        </div>
                                    }
                                    {
                                        message.text !== null &&
                                        <div className="message_text display-linebreak">
                                            {message.text}
                                        </div>
                                    }
                                    <div className="messgae_status">
                                        {moment(message.createdAt).format("hh:mm a")}{" "}
                                        {
                                            iAmSender &&
                                            <div className="tick_div">
                                                {message.status === 'received' && <img src={receivedImag} alt="" />}
                                                {message.status === 'sent' && <img src={sentImag} alt="" />}
                                                {message.status === 'seen' && <img src={seenImag} alt="" />}
                                            </div>
                                        }

                                    </div>
                                </div>
                                {/* <div className="message_reaction">
                                    <span>😋</span>
                                    <span>👍</span>
                                    <span>❤</span>
                                    <span>👏</span>
                                </div> */}
                            </div>
                        )
                    })
                }

            </div>
            <InputComponent replyOf={replyOf} setReplyOf={setReplyOf} />
            {msgSelectedForAction && (
                <div className="ma_model">
                    <div className="ma_heading">Actions</div>
                    <div className="model_cross_1" onClick={() => { setMsgSelectedForAction(null) }}><CloseIcon /></div>
                    <div className="model_selector_div">
                        <Tooltip title="Quote message" placement="top">
                            <div onClick={handleReply} className="ma">

                                <img src="images/replyIcon.png" />

                            </div>
                        </Tooltip>
                    </div>
                </div>
            )}
        </div>
    );
};

const InputComponent = ({ replyOf, setReplyOf }) => {
    const { activeChat, user, isPartnerTyping, chatData, socket } = useSelector(store => store.generalReducer);
    const textInputRef = useRef(null);
    const [text, setText] = useState("");
    const [emojiModelState, setEmojiModelState] = useState(false);
    const [attachmentModelState, setAttachmentModelState] = useState(false);
    const [attachedImage, setAttachedImage] = useState("");
    const { request: sendMsgReq, response: sendMsgRes } = useRequest();
    const [fileErr, setFileError] = useState(null)


    const outsideClickCloseEmojiListener = (e) => {
        if (setEmojiModelState && e.target.className.indexOf("epr") === -1) {
            setEmojiModelState(false);
        }
    };

    const fileInputChanged = (e) => {
        if (e.target.files && e.target.files[0]) {
            if (e.target.files[0].size > 1000000) {
                setFileError("Maximum file size allowed is 1 MB.");
                return
            }
            setAttachedImage(e.target.files[0]);
        }
    };

    const changeTextareaHeight = (e) => {
        if ((e.key === 'Enter' && e.shiftKey) || (e.key === 'Enter' && e.ctrlKey)) {
            sendHandler();
            return;
        }
        if (e.key === 'Enter') {
            if (textInputRef.current.rows < 3) {
                textInputRef.current.rows += 1;
            }
            return;
        }
    };

    const handleEmojiSelected = (e) => {
        setText((prev) => `${prev}${e.emoji}`);
        setEmojiModelState(false);
    };

    const cancelAttachHandler = () => {
        setAttachedImage(null)
        setAttachmentModelState(false)
        setText("");
    }

    const sendHandler = () => {
        if ((!text || (text.length === 1 && text.charCodeAt(0) === 10)) && !attachedImage) {
            toast.error("Message cannot be empty.")
            return;
        }
        const formData = new FormData();
        if (attachedImage) {
            formData.append("fileAttachments", attachedImage);
        }
        formData.append("text", text);
        formData.append("chatId", activeChat);
        formData.append("receiver", chatData.otherUser._id);
        if (replyOf) {
            formData.append("replyOf", replyOf._id);
        }

        sendMsgReq("POST", "/chat/create-message", formData, true);
        setText("")
        // console.log("send");
    };

    useEffect(() => {
        if (sendMsgRes && sendMsgRes.status) {
            setAttachedImage(null);
            setAttachmentModelState(false);
            setText("");
            if (replyOf) {
                handleReplyClose()
            }
        }
    }, [sendMsgRes])


    useEffect(() => {
        document
            .getElementById("root")
            .addEventListener("click", outsideClickCloseEmojiListener);
        return () => {
            document
                .getElementById("root")
                .removeEventListener("click", outsideClickCloseEmojiListener);
        };
    }, []);

    const handleRepliedMsgClicked = () => {
        let msgDiv = document.getElementById(replyOf._id)
        msgDiv.classList.add("selected_message");
        const topPosition = msgDiv.offsetTop;
        document.getElementById("messages_container").scrollTop = topPosition;
    }

    const handleReplyClose = () => {
        let msgDiv = document.getElementById(replyOf._id)
        msgDiv.classList.remove("selected_message");
        setReplyOf(null);
    }


    return (
        <>
            <div className="input_container">
                <div className="ic_field">
                    <div
                        className="emogi_div"
                        onClick={() => {
                            setEmojiModelState(!emojiModelState);
                        }}
                    >
                        <EmojiEmotionsIcon color="primary" />
                    </div>
                    <div className="text_input_area_div">
                        {isPartnerTyping && <div className="typing_status"><TypingLoader /></div>}
                        {
                            replyOf &&
                            <div className="reply_msg">
                                <div className="reply_msg_data" onClick={handleRepliedMsgClicked}>
                                    <img src="images/replyIcon.png" />
                                    <span>{replyOf.file !== null ? <i>File attachment ...</i> : makeLongStringShort(replyOf.text, 100)}</span>
                                </div>
                                <div>
                                    <CloseIcon onClick={handleReplyClose} />
                                </div>
                            </div>
                        }

                        <textarea
                            value={text}
                            ref={textInputRef}
                            rows="1"
                            className="text_input_area"
                            onKeyUp={changeTextareaHeight}
                            onChange={(e) => {
                                setText(e.target.value);
                                if (socket) {
                                    socket.emit('typing', { chatId: activeChat })
                                }
                            }}
                            placeholder="Press 'Enter' for line change || Press 'Ctrl + Enter' to send"
                        />
                    </div>

                    <div
                        className="attach_div"
                        onClick={() => {
                            setAttachmentModelState(!attachmentModelState);
                            setFileError(null);
                        }}
                    >
                        <AttachmentIcon />
                    </div>
                </div>
                <div className="ic_action">
                    <div>
                        <div className="ic_action_send" onClick={sendHandler}>
                            <SendIcon />
                        </div>
                    </div>
                </div>
            </div>
            {emojiModelState && (
                <div className="emoji_picker_model">
                    <EmojiPicker
                        searchDisabled={true}
                        onEmojiClick={handleEmojiSelected}
                    />
                </div>
            )}
            {attachmentModelState && (
                <div className="att_model">
                    <div className="att_heading">Attach an image</div>
                    <div className="model_cross_1" onClick={() => { setAttachmentModelState(false) }}><CloseIcon /></div>

                    <div className="att_selector_div">
                        {attachedImage ? (
                            <div className="att_image_div">
                                <img src={URL.createObjectURL(attachedImage)} alt="" />
                                <input
                                    className="att_text_input"
                                    onChange={(e) => {
                                        setText(e.target.value);
                                    }}
                                />

                                <div className="att_send_button">
                                    <Button onClick={cancelAttachHandler} variant="contained" color="error">Cancel</Button>
                                    <Button onClick={sendHandler} variant="contained">Send <SendIcon /></Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {fileErr && <div className="file_err">{fileErr}</div>}
                                <label className="att_upload_photo_label" for="upload_photo">
                                    Browse...
                                </label>
                                <input
                                    onChange={fileInputChanged}
                                    type="file"
                                    name="photo"
                                    id="upload_photo"
                                    className="att_upload_photo"
                                    accept="image/png, image/gif, image/jpeg"
                                />
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}

export default Chat;

