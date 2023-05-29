import React from 'react'
import noAvatar from "../../media/noAvatar.JPG"
import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';
import { useSelector, useDispatch } from 'react-redux';
import { setActiveMainComponent, setLogout } from '../../store/action';
import moment from 'moment'
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Logout from '@mui/icons-material/Logout';
import { PORT } from "../../constant/api"



const Header = () => {
  const { activeMainComponent, user, socket } = useSelector(store => store.generalReducer);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const dispatch = useDispatch();
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div className='header_container'>
      {activeMainComponent === "intro" && <IntroHeader />}
      {activeMainComponent === "startConversation" && <StartConvoHeader />}
      {activeMainComponent === "messages" && <ChatHeader />}
      {activeMainComponent === "accountSetting" && <AccSettingHeader />}


      <Tooltip title="Account settings">
        <IconButton
          onClick={handleClick}
          className='header_right'
        >
          <Avatar
          // className='blue_ring'
          >
            {/* <div className='header_left_img'>
              <img src={user?.avatar ? (`${PORT}/${user.avatar}`) : noAvatar} alt="" />
            </div> */}
            <SettingsIcon />
          </Avatar>

        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => {
          handleClose();
          dispatch(setActiveMainComponent("accountSetting"))
        }}>
          <Avatar /> Profile
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => {
          handleClose();
          dispatch(setLogout());
          if (socket) {
            socket.disconnect();
          }
        }}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

    </div>
  )
}

const IntroHeader = () => {
  return (
    <div className='header_left'>
    </div>
  )
}

const StartConvoHeader = () => {
  const { chatData } = useSelector(store => store.generalReducer)
  return (
    <div className='header_left'>
      <div className='header_left_img'><img src={chatData?.otherUser?.avatar ? (`${PORT}/${chatData.otherUser.avatar}`) : noAvatar} alt="" /></div>
      <div className='header_left_text'>
        <div className='hlt_name'>{chatData?.otherUser?.userName ? chatData.otherUser.userName : ""}</div>

      </div>
    </div>
  )
}

const ChatHeader = () => {
  const { chatData } = useSelector(store => store.generalReducer)
  return (
    <div className='header_left'>
      {/* <div className='header_right'><MenuIcon /></div> */}
      <div className='header_left_img'><img src={chatData?.otherUser?.avatar ? (`${PORT}/${chatData.otherUser.avatar}`) : noAvatar} alt="" /></div>
      <div className='header_left_text'>
        <div className='hlt_name'>{chatData?.otherUser?.userName ? chatData.otherUser.userName : ""}</div>
        {/* {
          chatData?.lastMessage?.createdAt &&
          <div className='hlt_status'>last seen {moment(chatData.lastMessage.createdAt).format("hh:mm a")}</div>
        } */}
      </div>
    </div>
  )
}

const AccSettingHeader = () => {
  return (
    <div className='header_left'>
      <div className='header_left_text'>
        <div className='hlt_name'>Account Setting</div>
      </div>
    </div>
  )
}

export default Header