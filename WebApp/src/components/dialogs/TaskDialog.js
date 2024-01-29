import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
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
import { SAVE_TASKS_API, UPDATE_TASK_API } from '../../constants';


const TaskDialog = (props) => {
    // props
    const { open, onClose, task, fetchTasks } = props;

    //get outline id 
    const { id: docId } = useParams();

    // field states
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(dayjs());
    const [note, setNote] = useState('');

    // form control states
    const [disabled, setDisabled] = useState(true);
    const [error, setError] = useState(false);

    // handlers
    const handleSubmit = async () => {
        if (task === null) {
            // create new task
            const newTask = {
                title,
                date: date ? new Date(date) : null,
                note,
                outline_id: docId,
                project_id: null,
            };
            const allTasks = [newTask];
            // new/save task request
            axios
                .post(SAVE_TASKS_API, JSON.stringify({ allTasks }))
                .then(async () => {
                    await fetchTasks();
                })
                .catch((error) => {
                    console.log(error);
                });
        } else {
            // edit existing task
            const updatedTask = {
                id: task.id,
                title,
                date: date ? new Date(date) : null,
                note,
            };

            // update request
            axios
                .post(UPDATE_TASK_API, JSON.stringify({ updatedTask }))
                .then(async () => {
                    await fetchTasks();
                })
                .catch((error) => {
                    console.log(error);
                });
        }

        // close dialog
        handleClose();
    };

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

    // update
    useEffect(() => {
        // edit task properties
        if (task !== null) {
            if (title === '' && !error) {
                setTitle(task.title);
                setDate(task.date ? dayjs(task.date) : null);
                setNote(task.note);
            }
        }

        // disable submit button
        setDisabled(error || title === '');
    }, [task, error, title]);

    return (
        <Dialog open={open}>
            <DialogTitle>{task === null ? 'Add Task' : 'Edit Task'}</DialogTitle>
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

                {/* Note Field */}
                <DialogField
                    id="note"
                    label="Note"
                    value={note}
                    onChange={(event) => {
                        setNote(event.target.value);
                    }}
                />
            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button variant="contained" onClick={handleSubmit} disabled={disabled}>
                    Submit
                </Button>
            </DialogActions>
        </Dialog>
    );
};

TaskDialog.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    task: PropTypes.object,
    fetchTasks: PropTypes.func
};

export default TaskDialog;
