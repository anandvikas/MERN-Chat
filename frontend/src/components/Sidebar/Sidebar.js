import React, { useState, useEffect } from "react";
import noAvatar from "../../media/noAvatar.JPG";
import useRequest from "../../hooks/UseRequest"
import { useDispatch, useSelector } from "react-redux";
import { removeArrivedNewMessages, setActiveChat, setActiveMainComponent, setChatData, setMyChats } from "../../store/action";
import moment from 'moment'
import { makeLongStringShort } from "../../utils/helper";
import sentImag from "../../media/sent.png";
import receivedImag from "../../media/received.png";
import seenImag from "../../media/seen.png";
import {PORT}  from "../../constant/api"



const Sidebar = () => {
    const [selectedTab, setSelectedTab] = useState("chatTab");
    const dispatch = useDispatch();

    const handleChangeTab = (tab) => {
        if (tab === 'chatTab') {
            dispatch(setActiveMainComponent('intro'))
            dispatch(setChatData(null))
        }
        setSelectedTab(tab)
    }

    return (
        <div className="side_bar">
            <div className="sb_tab_div">
                <div className={selectedTab === "chatTab" ? "selected_tab" : ""} onClick={() => handleChangeTab("chatTab")}>My Chats</div>
                <div className={selectedTab === "searchTab" ? "selected_tab" : ""} onClick={() => handleChangeTab("searchTab")}>Search</div>
            </div>
            {
                selectedTab === "chatTab" ? <MyChatList /> : <SearchUserList />
            }
        </div>
    );
};

const MyChatList = () => {
    const { request: getMyChatsReq, response: getMyChatsRes } = useRequest();
    const { socket, activeChat, myChats, user } = useSelector(store => store.generalReducer);
    const dispatch = useDispatch();

    useEffect(() => {
        getMyChatsReq("GET", "/chat/my-chats");
    }, [])

    useEffect(() => {
        if (getMyChatsRes && getMyChatsRes.status) {
            dispatch(setMyChats(getMyChatsRes.chats))
        }
    }, [getMyChatsRes])


    const handleSelected = (val) => {
        dispatch(setActiveMainComponent("messages"));
        dispatch(setActiveChat(val._id));
        dispatch(setChatData(val));
        socket?.emit('setActiveChat', { chatId: val._id });
    }

    return (
        <div className="list_div">
            {
                myChats.map(val => {
                    return (
                        <div key={val._id} className={`room_card ${activeChat === val._id ? "room_card_active" : ""}`} onClick={() => handleSelected(val)}>
                            <div className="room_card_img">
                                <img src={val?.otherUser?.avatar ? `${PORT}/${val.otherUser.avatar}` : noAvatar} alt="" />
                            </div>
                            <div className="room_card_content">
                                <div className="room_card_content_name">{val?.otherUser?.userName || val?.otherUser?.email || "---------"}</div>
                                <div className="room_card_content_msg">
                                    {
                                        val?.lastMessage?.sender?._id && val.lastMessage.sender._id === user._id &&
                                        <div className="tick_div">
                                            {val.lastMessage.status === 'received' && <img src={receivedImag} alt="" />}
                                            {val.lastMessage.status === 'sent' && <img src={sentImag} alt="" />}
                                            {val.lastMessage.status === 'seen' && <img src={seenImag} alt="" />}
                                        </div>
                                    }
                                    {
                                        val?.lastMessage?.file
                                            ?
                                            <i>File attachment ...</i>
                                            :
                                            (
                                                val?.lastMessage?.text
                                                    ?
                                                    makeLongStringShort(val.lastMessage.text, 25) :
                                                    "---------"
                                            )
                                    }
                                </div>
                            </div>
                            <div className="room_card_stat">
                                <div className="room_card_stat_time">{val?.lastMessage?.createdAt ? moment(val.lastMessage.createdAt).format("hh:mm a") : ""}</div>
                                {
                                    val?.unseenMessages && val.unseenMessages.length > 0 &&
                                    <div className="room_card_stat_count"><span>{val.unseenMessages.length}</span></div>
                                }

                            </div>
                        </div>
                    )
                })
            }
        </div>
    )
}

const SearchUserList = () => {
    const { socket } = useSelector(store => store.generalReducer);
    const dispatch = useDispatch();
    const [query, setQuery] = useState("");
    const [deBounceTime, setDebounceTime] = useState(0);
    const [searchedData, setSearchedData] = useState([])
    const { request: searchReq, response: searchRes } = useRequest();
    const { request: checkChatExistsReq, response: checkChatExistsRes } = useRequest();

    let timer;

    const handleChange = (e) => {
        const { value } = e.target;
        setQuery(value);
        setDebounceTime(2);
        clearTimeout(timer)
        timer = setTimeout(() => {
            setDebounceTime(0)
        }, 2000)
    }

    useEffect(() => {
        if (deBounceTime === 0) {
            searchReq("GET", `/user/search-users?query=${query}`);
        }
    }, [deBounceTime]);

    useEffect(() => {
        if (searchRes && searchRes.status) {
            setSearchedData(searchRes.users);
        }
    }, [searchRes]);

    const handleSelected = (val) => {
        checkChatExistsReq("POST", "/chat/check-exists", { otherUserId: val._id });
        dispatch(setChatData({
            otherUser: val
        }));
    }

    useEffect(() => {
        if (checkChatExistsRes && checkChatExistsRes.status) {
            if (checkChatExistsRes?.isChatExists && checkChatExistsRes?.chatId) {
                dispatch(setActiveMainComponent("messages"));
                dispatch(setActiveChat(checkChatExistsRes.chatId));
                dispatch(setChatData({
                    lastMessage: checkChatExistsRes.lastMessage
                }));
                socket?.emit('setActiveChat', { chatId: checkChatExistsRes.chatId });
            } else {
                dispatch(setActiveMainComponent("startConversation"));
            }
        }
    }, [checkChatExistsRes]);

    return (
        <>
            <div className="search_div">
                <input type="search" placeholder="Username / Email" value={query} onChange={handleChange} />
            </div>

            <div className="list_div">
                {
                    searchedData.map(val => {
                        return (
                            <div key={val._id} className="room_card" onClick={() => handleSelected(val)}>
                                <div className="room_card_img">
                                    <img src={`${PORT}/${val.avatar}`} alt="" />
                                </div>
                                <div className="room_card_content">
                                    <div className="room_card_content_name">{val.userName}</div>
                                    <div className="room_card_content_msg">{val.email}</div>
                                </div>
                                {/* <div className="room_card_stat">
                                    <div className="room_card_stat_time">12:5 AM</div>
                                    <div className="room_card_stat_count"><span>5</span></div>
                                </div> */}
                            </div>
                        )
                    })
                }
            </div>
        </>
    )
}


export default Sidebar;
