import {
    Avatar,
    Card,
    Chip,
    Grid,
    ListItem,
    ListItemButton,
    ListItemAvatar,
    ListItemText,
} from '@mui/material';
import {
    Assignment as AssignmentIcon,
    CheckBoxOutlined as CheckBoxIcon,
    FilePresentOutlined as FilePresentIcon,
    NoteOutlined as NoteIcon,
} from '@mui/icons-material';

import { DOCS_API } from '../../constants';
import UserAvatar from '../items/UserAvatar';
import TaskDialog from '../dialogs/TaskDialog';

import { useNavigate } from 'react-router-dom';
import React, { Fragment, useEffect, useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

export const OverviewItem = (props) => {
    const { task } = props;
    // const { task, projectId } = props;
    // const [projectTitle, setProjectTitle] = useState(null);
    const [originDoc, setOriginDoc] = useState(null);
    const [isChecked, setIsChecked] = useState(false);

    // const navigate = useNavigate();

    // const onClick = (e) => {
    //     e.preventDefault();
    //     navigate(`/tasks/${task.id}`, {
    //         state: { task, projectId, projectTitle, originDoc },
    //     });
    // };

    const handleCheckboxChange = () => {
        setIsChecked(!isChecked);
        console.log('checked overview item');
    };

    useEffect(() => {
        const getData = async () => {
            // if (task.project) {
            //     const result = await axios.get(PROJECTS_API, {
            //         params: { id: task.project },
            //     });
            //     // setProjectTitle(result.data.records[0].title);
            //     console.log(result.data.records[0].title);
            // }
            if (task.outline) {
                const result = await axios.get(DOCS_API, {
                    params: { id: task.outline },
                });
                setOriginDoc(result.data.records[0].title);
            }
        };

        getData();
    }, []);

    return (
        <Fragment>
            <Card onClick={() => {}} sx={{ width: '100%', mb: 1 }}>
                <ListItemButton sx={{ display: 'flex' }}>
                    <ListItemText
                        primary={task.title}
                        secondary={originDoc}
                        sx={{ width: '80%' }}
                    />
                    <ListItemText
                        primary={task.date}
                        secondary={originDoc}
                        sx={{ width: '80%' }}
                    />
                    <CheckBoxIcon
                        sx={{ mr: 2, color: isChecked ? '#06bf2b' : '#808080' }}
                        onClick={handleCheckboxChange}
                    />
                </ListItemButton>
            </Card>
        </Fragment>
    );
};

export const ScannedItem = (props) => {
    const { title, date } = props;

    return (
        <Card variant="outlined" sx={{ mb: 1 }}>
            <ListItem>
                <ListItemAvatar>
                    <Avatar>
                        <AssignmentIcon />
                    </Avatar>
                </ListItemAvatar>
                <ListItemText primary={title} secondary={date} />
            </ListItem>
        </Card>
    );
};

export const DocumentTaskItem = (props) => {
    // props
    const { task, fetchTasks } = props;

    // states
    const [taskDialogOpen, setTaskDialogOpen] = useState(false);

    return (
        <Fragment>
            <Card
                sx={{ width: '100%', mb: '10px' }}
                onClick={() => setTaskDialogOpen(true)}
            >
                <ListItemButton disableRipple>
                    <ListItemAvatar>
                        <Avatar>
                            <AssignmentIcon />
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={task.title} secondary={task.date} />
                </ListItemButton>
            </Card>
            <TaskDialog
                key={task.id}
                open={taskDialogOpen}
                fetchTasks={fetchTasks}
                task={task}
                onClose={() => {
                    setTaskDialogOpen(false);
                }}
            />
        </Fragment>
    );
};

export const TaskItem = (props) => {
    const { task, projectId } = props;
    const [projectTitle, ] = useState(null);
    const [originDoc, setOriginDoc] = useState(null);
    const navigate = useNavigate();
    const onClick = (e) => {
        e.preventDefault();
        navigate(`/tasks/${task.id}`, {
            state: { task, projectId, projectTitle, originDoc },
        });
    };

    useEffect(() => {
        const getData = async () => {
            // if (task.project) {
            //     const result = await axios.get(PROJECTS_API, {
            //         params: { id: task.project },
            //     });
            //     setProjectTitle(result.data.records[0].title);
            // }
            if (task.outline) {
                const result = await axios.get(DOCS_API, {
                    params: { id: task.outline },
                });
                setOriginDoc(result.data.records[0].title);
            }
        };

        getData();
    }, []);

    return (
        <Fragment>
            <Card onClick={onClick} sx={{ width: '100%', mb: 1 }}>
                <ListItemButton sx={{ display: 'flex' }}>
                    {originDoc ? (
                        <CheckBoxIcon sx={{ mr: 2, color: '#f85800' }} />
                    ) : (
                        <CheckBoxIcon sx={{ mr: 2, color: '#1976d2' }} />
                    )}
                    <ListItemText
                        primary={task.title}
                        secondary={originDoc}
                        sx={{ width: '80%' }}
                    />

                    <Grid
                        container
                        columnSpacing={{ xs: 1, sm: 2, md: 3 }}
                        sx={{ justifyContent: 'flex-end' }}
                    >
                        <Grid item>
                            {task.date !== 'None' && <Chip label={task.date} />}
                        </Grid>

                        <Grid item>
                            {projectTitle && <ListItemText primary={projectTitle} />}
                        </Grid>

                        <Grid item>{task.note && <NoteIcon />}</Grid>

                        <Grid item>
                            <FilePresentIcon />
                        </Grid>

                        <Grid item>
                            <UserAvatar
                                sx={{ height: 35, width: 35 }}
                                name={task.assignee ? task.assignee.name : 'Not assigned'}
                            />
                        </Grid>
                    </Grid>
                </ListItemButton>
            </Card>
        </Fragment>
    );
};

// prop types
OverviewItem.propTypes = {
    // title: PropTypes.string,
    // date: PropTypes.string,
    task: PropTypes.object,
    fetchTasks: PropTypes.func,
    projectId: PropTypes.string,
};

ScannedItem.propTypes = {
    title: PropTypes.string,
    date: PropTypes.string,
};

TaskItem.propTypes = {
    task: PropTypes.object,
    fetchTasks: PropTypes.func,
    projectId: PropTypes.string,
};

DocumentTaskItem.propTypes = {
    task: PropTypes.object,
    fetchTasks: PropTypes.func,
};
