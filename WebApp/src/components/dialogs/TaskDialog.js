import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Button,
    InputLabel,
    MenuItem,
    FormControl,
    Select,
} from '@mui/material';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import DialogField from './DialogField';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { SAVE_TASKS_API, PRIORITIES_API } from '../../constants';

const TaskDialog = (props) => {
    // props
    const { open, onClose } = props;

    //get outline id
    const { id: projectId } = useParams();

    // field states
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(dayjs());
    const [note, setNote] = useState('');
    const [priority, setPriority] = useState(0);
    const [isFieldsSet, setIsFieldsSet] = useState(false);

    // form control states
    const [error, setError] = useState(false);

    // handlers
    const handleSubmit = async () => {
    // create new task
        const newTask = {
            title,
            date: date ? new Date(date) : null,
            note,
            outline_id: null,
            project_id: projectId,
            priority,
            completion_date: date ? new Date(date) : null,
        };

        const allTasks = [newTask];
        // new/save task request
        axios
            .post(SAVE_TASKS_API, JSON.stringify({ type: 'add', data: allTasks }))
            .catch((error) => {
                console.log(error);
            });

        // close dialog
        handleClose();
    };

    const fetchPriority = async () => {
        console.log(title, note, date, projectId);

        try {
            axios
                .get(PRIORITIES_API, {
                    params: {
                        title: title,
                        note: note,
                        date: date,
                        project_id: projectId,
                    },
                })
                .then((res) => {
                    console.log(res);
                    console.log('yooooo ' + res.data);
                    setPriority(res.data);
                });
        } catch (error) {
            console.error('Error fetching priority:', error);
        }
    };

    useEffect(() => {
        setIsFieldsSet(title !== '' && date !== '' && note !== '');
    }, [title, date, note]);

    // useEffect(()=>{
    //     fetchPriority();
    // }, []);

    const handleTitleChange = (e) => {
        e.preventDefault();
        setTitle(e.target.value);
        setError(e.target.value === '');
    };

    const handleClose = () => {
    // reset fields
        setTitle('');
        setDate(dayjs());
        setNote('');

        // reset form control
        setError(false);

        // close
        onClose();
    };

    return (
        <Dialog open={open}>
            <DialogTitle>{'Add Task'}</DialogTitle>
            <DialogContent>
                {/* Title Field */}
                <DialogField
                    id="title"
                    label="Title"
                    value={title}
                    error={error}
                    onChange={handleTitleChange}
                />

                {/* Date Field */}
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        label="Due Date"
                        sx={{ width: '100%', mt: 2 }}
                        margin="dense"
                        value={date}
                        onChange={(newValue) => setDate(newValue)}
                        slotProps={{
                            textField: {
                                variant: 'standard',
                                helperText: 'MM / DD / YYYY',
                            },
                        }}
                    />
                </LocalizationProvider>

                {/* Priority Field */}
                <div
                    style={{ display: 'flex', alignItems: 'center', marginTop: '16px' }}
                >
                    <FormControl variant="filled" style={{ flex: 1, marginRight: '8px' }}>
                        <InputLabel id="priority-label">Priority</InputLabel>
                        <Select
                            labelId="priority-label"
                            id="priority"
                            label="priority"
                            value={priority}
                            onChange={(event) => {
                                setPriority(event.target.value);
                            }}
                            style={{ width: '100%' }}
                        >
                            {[...Array(10)].map((_, index) => (
                                <MenuItem key={index} value={index + 1}>
                                    {index + 1}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={fetchPriority}
                        disabled={!isFieldsSet}
                    >
            Generate Priority
                    </Button>
                </div>

                {/* Description Field */}
                <TextField
                    fullWidth
                    multiline
                    rows={5}
                    label="Description"
                    value={note}
                    variant="outlined"
                    sx={{ mt: 4 }}
                    onChange={(e) => {
                        setNote(e.target.value);
                    }}
                />
            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={title === ''}
                >
          Submit
                </Button>
            </DialogActions>
        </Dialog>
    );
};

TaskDialog.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    fetchTasks: PropTypes.func,
};

export default TaskDialog;
