import { TextField } from '@mui/material';
import React from 'react';


const DialogField = (props) => {
    return (
        <TextField
            type="text"
            margin="dense"
            fullWidth
            variant="standard"
            {...props}
        />
    );
};

export default DialogField;
