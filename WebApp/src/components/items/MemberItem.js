import React, { useContext } from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import { Button } from '@mui/material';
import PropTypes from 'prop-types';
import { AuthContext } from '../pages/auth/Auth';
import UserAvatar from './UserAvatar';

const MemberItem = (props) => {
    const { ownerId, data, onRemove } = props;
    const { name, user_id, email } = data;
    const { userInfo } = useContext(AuthContext);
    return (
        <ListItem 
            key={2}
            style={ { marginBottom: '10px' } }
            secondaryAction={
                userInfo.userId === ownerId && user_id !== ownerId &&
                    <Button variant='contained' color='error' onClick={() => onRemove(user_id)}>
                    Remove
                    </Button>
            }
            disablePadding
        >
            <ListItemButton disableRipple>
                <ListItemAvatar>
                    <UserAvatar name={name} />
                </ListItemAvatar>
                <ListItemText  primary={`${name} ${!ownerId ? '(Owner)' : ''}`} secondary={email} />
            </ListItemButton>
        </ListItem>
    );
};

MemberItem.propTypes = {
    data: PropTypes.object,
    ownerId: PropTypes.string,
    onRemove: PropTypes.func,
};

export default MemberItem;
