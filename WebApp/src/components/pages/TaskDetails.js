import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { UPDATE_TASK_API } from '../../constants';
import axios from 'axios';

import {
    Box,
    Breadcrumbs,
    Typography,
    Link,
    Divider,
    Button,
    TextField,
    InputLabel,
    MenuItem,
    FormControl,
    Select,
} from '@mui/material';
import { TASKS_API, PROJECTS_API } from '../../constants';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import SuggestionBox from '../containers/SuggestionBox';


const TaskDetails = () => {
    const location = useLocation();
    const projectTitle = location.state.projectTitle;
    const originDoc = location.state.originDoc;
    const projectId = location.state.projectId;

    const [task, setTask] = useState(null);
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(null);
    const [note, setNote] = useState('');
    const [error, setError] = useState(false);
    const [isEdited, setIsEdited] = useState(false);
    const [assignee, setAssignee] = useState('');
    const [members, setMembers] = useState([]);

    const handleSubmit = async () => {
        const updatedTask = {
            id: task.id,
            title,
            date: date ? dayjs(date) : null,
            note,
            assignee
        };
        try {
            axios
                .post(UPDATE_TASK_API, JSON.stringify({ updatedTask }));
        } catch (error) {
            console.error('Error updating task:', error);
        }
        setIsEdited(false);
    };

    const handleCancel = () => {
        setTitle(task.title);
        setDate(dayjs(task.date));
        setNote(task.note);
        setIsEdited(false);
    };

    const handleTitleChange = (e) => {
        e.preventDefault();
        setTitle(e.target.value);
        setError(e.target.value === '');
    };

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                axios
                    .get(TASKS_API, {
                        params: { id: location.state.task.id },
                    })
                    .then((response) => {
                        const newTask = response.data.records[0];
                        setTask(newTask);
                        setTitle(newTask.title);
                        setDate(dayjs(newTask.date));
                        setNote(newTask.note);
                        setAssignee(newTask.assignee ? newTask.assignee.user_id : '');
                    });
            } catch (error) {
                console.error('Error loading task:', error);
            }
        };
        const fetchMembers = async () => {
            axios
                .get(PROJECTS_API, { params: { id: projectId, members: true }})
                .then((res) => {
                    setMembers(res.data.records);
                });
        };
        fetchTasks();
        fetchMembers();
        
    }, []);

    return (
        <Box display="flex" flex="1" flexDirection="column">
            <Breadcrumbs aria-label="breadcrumb" sx={{ ml: 4, mt: 3, mr: 4 }}>
                <Link underline="hover" color="inherit" href={'/projects/my-projects'}>
          Projects
                </Link>
                <Link
                    underline="hover"
                    color="inherit"
                    href={`/projects/${projectId}/overview`}
                >
                    {projectTitle}
                </Link>
                <Link
                    underline="hover"
                    color="inherit"
                    href={`/projects/${projectId}/tasks`}
                >
          Tasks
                </Link>
                <Typography color="text.primary">{`Task ${location.state.task.id}`}</Typography>
            </Breadcrumbs>

            <Box display="flex" height="100%" >
                <Box
                    display="flex"
                    flex="0.7"
                    flexDirection="column"
                    sx={{
                        ml: 4,
                        mt: 3,
                        mr: 4,
                        pb: 4,
                        overflowY: 'auto',
                        maxHeight: 'calc(100vh - 120px)', // Adjust the height as needed
                    }}
                >
                    
                    <TextField
                        fullWidth
                        onChange={(e) => {
                            setIsEdited(true);
                            handleTitleChange(e);
                        }}
                        label="Title"
                        value={title}
                        error={error}
                        variant="outlined"
                        sx={{ mt: 4 }}
                    />

                    <TextField
                        fullWidth
                        multiline
                        rows={20}
                        label="Description"
                        value={note}
                        variant="outlined"
                        sx={{ mt: 4 }}
                        onChange={(e) => {
                            setIsEdited(true);
                            setNote(e.target.value);
                        }}
                    />

                    <SuggestionBox title={title} description={note} projectId={projectId} sx={{ mt: 2 }} />
                </Box>

                <Divider ml={5} flexItem flex="1" orientation="vertical" />

                <Box
                    display="flex"
                    flex="0.3"
                    flexDirection="column"
                    sx={{ ml: 4, mt: 3, mr: 4 }}
                    justifyItems="center"
                    overflow="auto"
                >
                    <DatePicker
                        label="Due Date"
                        sx={{ mt: 4 }}
                        value={date}
                        slotProps={{
                            textField: {
                                helperText: 'MM/DD/YYYY',
                            },
                        }}
                        onChange={(newValue) => {
                            setDate(newValue);
                            setIsEdited(true);
                        }}
                    />

                    <FormControl variant="filled" sx={{ mt: 1, minWidth: 120 }}>
                        <InputLabel id="assignee-label">Assignee</InputLabel>
                        <Select
                            labelId="assignee-label"
                            id="assignee"
                            label="Assignee"
                            value={assignee || ''}
                            onChange={(event) => {
                                setAssignee(event.target.value);
                                setIsEdited(true);
                            }}
                            
                        >
                            <MenuItem value="">
                                <em>None</em>
                            </MenuItem>
                            {members && members.map(
                                (member) => 
                                    (<MenuItem key={member.user_id} value={member.user_id}>{`${member.name}`}</MenuItem>)
                            )}
                        </Select>
                    </FormControl>

                    <DatePicker
                        label="Created On"
                        sx={{ mt: 4 }}
                        slotProps={{
                            textField: {
                                helperText: 'MM/DD/YYYY',
                            },
                        }}
                        components={{
                            OpenPickerIcon: () => null,
                        }}
                        value={date}
                        readOnly
                    />

                    <TextField
                        fullWidth
                        label="Origin"
                        value={originDoc ? originDoc : 'No document associated.'}
                        variant="filled"
                        sx={{ mt: 2 }}
                        InputProps={{
                            readOnly: true,
                        }}
                    />

                    {isEdited && (
                        <Box
                            sx={{
                                marginLeft: 'auto',
                                marginTop:'auto',
                                marginRight: '1vh',
                                marginBottom: '5%',
                                display: 'flex',
                                flexDirection: 'row',
                            }}
                        >
                            <Button
                                variant="contained"
                                onClick={() => {
                                    handleSubmit();
                                }}
                                sx={{ mr: 3 }}
                            >
                CONFIRM
                            </Button>
                            <Button
                                variant="contained"
                                onClick={() => {
                                    handleCancel();
                                }}
                            >
                CANCEL
                            </Button>
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default TaskDetails;
