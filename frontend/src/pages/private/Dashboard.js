import React from 'react'
import Mainbar from '../../components/Mainbar/Mainbar'
import Sidebar from '../../components/Sidebar/Sidebar'


const Dashboard = () => {
    return (
        <div className='dashboard'>
            <Sidebar/>
            <Mainbar/>
        </div>
    )
}
export default Dashboard
