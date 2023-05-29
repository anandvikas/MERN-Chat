import {
    SET_LOGIN,
    SET_ACTIVE_PAGE,
    SET_LOGOUT,
    SET_LOADING,
    SET_SOCKET,
    SET_ACTIVE_MAIN_COMPONENT,
    SET_ACTIVE_CHAT,
    SET_CHAT_DATA,
    UPDATE_PROFILE,
    SET_IS_PARTNER_TYPING,
    ADD_MESSAGE,
    REMOVE_MESSAGE,
    SET_ARRIVED_NEW_MESSAGES,
    REMOVE_ARRIVED_NEW_MESSAGES,
    SET_MY_CHATS,
    SET_ACTIVE_CHAT_MESSAGES,
    SET_ACTIVE_CHAT_NEW_MESSAGES,
    SET_NEW_SEEN_MARKED_MESSAGES,
    SET_NEW_RECEIVED_MARKED_MESSAGES,
    SET_TYPING
} from "./actionTypes"

export const setLoading = (bool) => {
    return {
        type: SET_LOADING,
        payload: bool
    }
}

export const setLogin = (data) => {
    if (!data?.token) {
        return {
            type: SET_LOGOUT,
        }
    }
    localStorage.setItem('auth', JSON.stringify(data.token))
    return {
        type: SET_LOGIN,
        payload: data
    }
}

export const setLogout = () => {
    localStorage.removeItem('auth')

    return {
        type: SET_LOGOUT,
    }
}

export const setActivePage = (data) => {
    return {
        type: SET_ACTIVE_PAGE,
        payload: data
    }
}

export const setSocket = (data) => {
    return {
        type: SET_SOCKET,
        payload: data
    }
}

export const setActiveMainComponent = (data) => {
    return {
        type: SET_ACTIVE_MAIN_COMPONENT,
        payload: data
    }
}

export const setActiveChat = (data) => {
    return {
        type: SET_ACTIVE_CHAT,
        payload: data
    }
}

export const setChatData = (data) => {
    return {
        type: SET_CHAT_DATA,
        payload: data
    }
}

export const updateProfile = (data) => {
    return {
        type: UPDATE_PROFILE,
        payload: data
    }
}

export const setIsPartnerTyping = (data) => {
    return {
        type: SET_IS_PARTNER_TYPING,
        payload: data
    }
}

export const addMessage = (data) => {
    return {
        type: ADD_MESSAGE,
        payload: data
    }
}

export const removeMessage = (data) => {
    return {
        type: REMOVE_MESSAGE,
        payload: data
    }
}

export const setArrivedNewMessages = (data) => {
    return {
        type: SET_ARRIVED_NEW_MESSAGES,
        payload: data
    }
}

export const removeArrivedNewMessages = (data) => {
    return {
        type: REMOVE_ARRIVED_NEW_MESSAGES,
    }
}

export const setMyChats = (data) => {
    return {
        type: SET_MY_CHATS,
        payload: data
    }
}

export const setActiveChatMessages = (data) => {
    return {
        type: SET_ACTIVE_CHAT_MESSAGES,
        payload: data
    }
}

export const setActiveChatNewMessages = (data) => {
    return {
        type: SET_ACTIVE_CHAT_NEW_MESSAGES,
        payload: data
    }
}

export const setNewSeenMarkedMessages = (data) => {
    return {
        type: SET_NEW_SEEN_MARKED_MESSAGES,
        payload: data
    }
}

export const setNewReceivedMarkedMessages = (data) => {
    return {
        type: SET_NEW_RECEIVED_MARKED_MESSAGES,
        payload: data
    }
}

