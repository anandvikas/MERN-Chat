import React from 'react'
import Chat from '../Chat/Chat'
import Footer from '../Footer/Footer'
import Header from '../Header/Header'
import Intro from '../Intro/Intro'
import { useSelector } from 'react-redux'
import StartConvo from '../StartConvo/StartConvo'
import AccountSetting from '../AccountSetting/AccountSetting'

const Mainbar = () => {
    const { activeMainComponent } = useSelector(store => store.generalReducer)
    return (
        <div className='main_bar'>
            <Header />
            {activeMainComponent === "intro" && <Intro />}
            {activeMainComponent === "startConversation" && <StartConvo />}
            {activeMainComponent === "messages" && <Chat />}
            {activeMainComponent === "accountSetting" && <AccountSetting />}
            <Footer />
        </div>
    )
}

export default Mainbar