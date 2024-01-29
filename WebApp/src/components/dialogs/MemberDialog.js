import { 
    Button, 
    Dialog, DialogActions, DialogTitle, DialogContent,
    TextField,
    Autocomplete,
    DialogContentText
} from '@mui/material';



import { MY_PROJECTS_URL, USERS_API } from '../../constants';
import axios from 'axios';

import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { AuthContext } from '../pages/auth/Auth';
import { useNavigate } from 'react-router-dom';


const MemberDialog = (props) => {
    // props
    const { open, onClose, members, ownerId, onAdd, onRemove } = props;

    const { userInfo } = useContext(AuthContext);
    const isAddMember = userInfo.userId === ownerId;
    const navigate = useNavigate();

    // states
    const [selectedMember, setSelectedMember] = useState(null);
    const [allUsers, setAllUsers] = useState([]);
  
    const handleChange = (event, value) => setSelectedMember(value);

    const handleAdd = (e) => {
        e.preventDefault();
        onClose();
        onAdd(selectedMember.user_id);
    };

    const handleRemove = (e) => {
        e.preventDefault();
        onClose();
        onRemove(userInfo.userId);
        navigate(MY_PROJECTS_URL, { replace: true });
    };
    
    useEffect(() => {
        const getUsers = async () => {
            const result = await axios.get(USERS_API);
            const nonMembers = result.data.records
                .filter(member => !members.some(currentMember => currentMember.user_id === member.user_id) && member.user_id !== ownerId)
                .map(m => { 
                    m.label = `${m.name} (${m.email})`;
                    return m;
                });
            setAllUsers(nonMembers);
            
        };
        getUsers();
        setSelectedMember(null);
        
    }, [members, open]);
    

    return (
        <Dialog open={open} fullWidth maxWidth={'sm'}>
            {isAddMember ? 
                <><DialogTitle>Add a Project Member</DialogTitle><DialogContent dividers>
                    <Autocomplete
                        id="combo-box-demo"
                        options={allUsers}
                        sx={{ maxHeight: 300, overflow: 'unset', position: 'relative', zIndex: 9999 }}
                        renderInput={(params) => <TextField {...params} label="Search user" />}
                        onChange={handleChange}
                        isOptionEqualToValue={(option, value) => option.value === value.value} />
                </DialogContent><DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button onClick={handleAdd} variant="contained" disabled={selectedMember === null}>Add</Button>
                </DialogActions></> 
                : 
                <><DialogTitle>Leave Project</DialogTitle><DialogContent dividers>
                    <DialogContentText>
                        Are you sure you want to leave this project? This action cannot be undone. Only project owner can add members.
                    </DialogContentText>
                </DialogContent><DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button onClick={handleRemove} variant="contained" color="error">Leave</Button>
                </DialogActions></>
            }
        </Dialog>
    );
};

MemberDialog.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    onAdd: PropTypes.func,
    onRemove: PropTypes.func,
    members: PropTypes.array,
    ownerId: PropTypes.string
    
};

export default MemberDialog;
