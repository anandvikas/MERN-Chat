import { combineReducers } from "redux";
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
} from "./actionTypes"

const initialState = {
    login: false,
    token: null,
    user: null,
    loading: false,
    activeMainComponent: "intro",
    activeChat: null,
    chatData: {},
    projectName: "Vikas",
    isPartnerTyping: false,
    socket: null,
    arrivedNewMessages: [],
    myChats: [],
    activeChatMessages: [],
    activeChatNewMessages: {},
    newSeenMarkedMessages: [],
    newReceivedMarkedMessages: [],
}

const generalReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_LOADING: return { ...state, loading: action.payload }
        case SET_LOGIN: return { ...state, login: true, ...action.payload }
        case SET_LOGOUT: return { ...initialState }
        case SET_SOCKET: {
            return { ...state, socket: action.payload };
        }
        case SET_ACTIVE_MAIN_COMPONENT: {
            return { ...state, activeMainComponent: action.payload };
        }
        case SET_ACTIVE_CHAT: {
            return { ...state, activeChat: action.payload };
        }
        case SET_CHAT_DATA: {
            return { ...state, chatData: { ...state.chatData, ...action.payload } };
        }
        case UPDATE_PROFILE: {
            return { ...state, user: { ...state.user, ...action.payload } };
        }
        case SET_IS_PARTNER_TYPING: {
            return { ...state, isPartnerTyping: action.payload };
        }
        case SET_ARRIVED_NEW_MESSAGES: {
            return { ...state, arrivedNewMessages: [...state.arrivedNewMessages, action.payload] };
        }
        case REMOVE_ARRIVED_NEW_MESSAGES: {
            return { ...state, arrivedNewMessages: [] };
        }
        case SET_MY_CHATS: {
            return { ...state, myChats: action.payload };
        }
        case SET_ACTIVE_CHAT_MESSAGES: {
            return { ...state, activeChatMessages: action.payload };
        }
        case SET_ACTIVE_CHAT_NEW_MESSAGES: {
            return { ...state, activeChatNewMessages: action.payload };
        }
        case SET_NEW_SEEN_MARKED_MESSAGES: {
            return { ...state, newSeenMarkedMessages: action.payload };
        }
        case SET_NEW_RECEIVED_MARKED_MESSAGES: {
            return { ...state, newReceivedMarkedMessages: action.payload };
        }

        default: return { ...state }
    }
}

const initialMessages = {}

const messageReducer = (state = initialMessages, action) => {
    switch (action.type) {
        case ADD_MESSAGE: {
            if (state[action.payload.chatId]) {
                return { ...state, [action.payload.chatId]: [...state[action.payload.chatId], action.payload.message] }
            } else {
                return { ...state, [action.payload.chatId]: [action.payload.message] };
            }
        }
        case REMOVE_MESSAGE: {
            return { ...state, [action.payload]: [] };
        }
        case SET_LOGOUT: return { ...initialMessages }
        default: return { ...state }
    }
}

// root reducer ------------------------------------------------------
const rootReducer = combineReducers({
    generalReducer: generalReducer,
    messageReducer: messageReducer
});
export default rootReducer;