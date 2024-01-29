import { 
    Box,
    Button,
    Dialog, DialogActions, DialogTitle, DialogContent,
    InputLabel,
    FormControl,
    MenuItem,
    Select,
    Stack,
    TextField, 
    Typography
} from '@mui/material';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import React from 'react';
import PropTypes from 'prop-types';


const NewTaskDialog = (props) => {
    // props
    const { open, onClose } = props;

    // states
    const handleClose = () => {
        onClose();
    };

    const handleAdd = (e) => {
        e.preventDefault();
        handleClose();
    };

    return (
        <Dialog open={open} fullWidth maxWidth={'sm'}>
            <DialogTitle>Add a Task</DialogTitle>
            <DialogContent dividers>
                <TextField
                    fullWidth
                    label="Title"
                    variant="standard"
                    sx={{ mb: '30px' }}
                />
                <Stack direction="row" justifyContent={'space-between'} mb={3}>
                    <Stack direction="row">
                        <Typography mr={5} width={'90px'}>
                            Created By
                        </Typography>
                        <FormControl disabled>
                            <InputLabel id="demo-simple-select-label">Creator</InputLabel>
                            <Select
                                id="demo-simple-select"
                                value={'20'}
                                label="Age"
                                sx={{ height: '50px', width: '150px' }}
                            >
                                <MenuItem value={10}>Ten</MenuItem>
                                <MenuItem value={20}>Twenty</MenuItem>
                                <MenuItem value={30}>Thirty</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>
                    <Box>
                        <Typography>Related Project: </Typography>
                    </Box>
                </Stack>
                <Stack direction="row" justifyContent={'space-between'} mb={3}>
                    <Stack direction="row">
                        <Typography mr={5} width={'90px'}>
                            Assigned to
                        </Typography>
                        <FormControl>
                            <InputLabel id="demo-simple-select-label">Assigned</InputLabel>
                            <Select
                                id="demo-simple-select"
                                value={'20'}
                                label="Age"
                                sx={{ height: '50px', width: '150px' }}
                            >
                                <MenuItem value={10}>Ten</MenuItem>
                                <MenuItem value={20}>Twenty</MenuItem>
                                <MenuItem value={30}>Thirty</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>
                    <Box>
                        <Typography>Related Document: </Typography>
                    </Box>
                </Stack>
                <Stack direction="row" justifyContent={'flex-start'}>
                    <Typography mr={5} width={'90px'}>
                        Due Date
                    </Typography>
                    <FormControl>
                        <DatePicker sx={{ width: '150px' }} />
                    </FormControl>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button variant="contained" onClick={handleAdd}>
                    Add
                </Button>
            </DialogActions>
        </Dialog>
    );
};

NewTaskDialog.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func
};

export default NewTaskDialog;
