import { Avatar } from '@mui/material';
import React from 'react';
import PropTypes from 'prop-types';

function stringToColor(string) {
    let hash = 0;
    let i;
  
    /* eslint-disable no-bitwise */
    for (i = 0; i < string.length; i += 1) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
  
    let color = '#';
  
    for (i = 0; i < 3; i += 1) {
        const value = (hash >> (i * 8)) & 0xff;
        color += `00${value.toString(16)}`.slice(-2);
    }
    /* eslint-enable no-bitwise */
  
    return color;
}

const getName = (name) => {
    let nameInitials = '';
    if(name.split(' ').length === 1){
        return name.split(' ')[0][0];
    }
    for(let i = 0; i < 2; i += 1){
        if(name.split(' ')[i] !== ''){
            nameInitials += name.split(' ')[i][0];
        }
    }
    return nameInitials.toUpperCase();
};
  
function stringAvatar(name) {
    return {
        sx: {
            bgcolor: stringToColor(name),
        },
        children: getName(name),
    };
}

const UserAvatar = (props) => {
    const { name, sx: customSx, ...other } = props;
    const avatarProps = stringAvatar(name);
    return (
        <Avatar sx={{ ...avatarProps.sx, ...customSx }} {...other}>
            {avatarProps.children}
        </Avatar>
    );
};

// prop types
UserAvatar.propTypes = {
    name: PropTypes.string,
    sx: PropTypes.object,
};
export default UserAvatar;
