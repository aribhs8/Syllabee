import { Divider, IconButton, ListItemIcon, Menu, MenuItem, Toolbar, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Logout as LogoutIcon, Settings } from '@mui/icons-material';
import { AuthContext } from '../pages/auth/Auth';

import MuiAppBar from '@mui/material/AppBar';
import React, { useContext } from 'react';
import logo from '../../assets/new logo.png';
import UserAvatar from '../items/UserAvatar';   


const Bar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
}));

const AppBar = () => {
    const { isLoggedIn, userInfo, logout } = useContext(AuthContext);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <Bar position="fixed" elevation={0}>
            <Toolbar variant='dense' disableGutters sx={{ paddingLeft: 1.3 }}>
                <img src={logo} style={{ width: '25px', marginRight: 25 }} alt='Project Pulse Logo' />
                <Typography variant="subtitle" fontWeight={500} fontSize={17} noWrap component="div" flexGrow={1}>Project Pulse</Typography>
                {isLoggedIn && 
                 <div>
                     <IconButton
                         onClick={handleClick}
                         size="small"
                         sx={{ mr: 4 }}
                         aria-controls={open ? 'account-menu' : undefined}
                         aria-haspopup="true"
                         aria-expanded={open ? 'true' : undefined}
                     >
                         <UserAvatar sx={{ width: 35, height: 35 }} name={userInfo.name}/>
                     </IconButton>
                     <Menu
                         anchorEl={anchorEl}
                         id="account-menu"
                         open={open}
                         onClose={handleClose}
                         onClick={handleClose}
                         transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                         anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                     >
                         <MenuItem onClick={handleClose}>
                             <UserAvatar sx={{ width: 35, height: 35 }} name={userInfo.name}/>
                             <Typography pl={2}>{userInfo.name}</Typography>
                         </MenuItem>
                         <Divider />
                         <MenuItem onClick={handleClose}>
                             <ListItemIcon>
                                 <Settings fontSize="small" />
                             </ListItemIcon>
                             <Typography fontSize={15} >Settings</Typography>
                         </MenuItem>
                         <MenuItem onClick={() => {
                             logout();
                             handleClose();
                         }}>
                             <ListItemIcon>
                                 <LogoutIcon fontSize="small" />
                             </ListItemIcon>
                             <Typography fontSize={15} >Log out</Typography>
                         </MenuItem>
                     </Menu>
                 </div>
                
                }
            </Toolbar>
        </Bar>
    );
};

export default AppBar;
