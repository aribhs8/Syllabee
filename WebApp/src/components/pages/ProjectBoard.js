import React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { Typography } from '@mui/material';
import { useEffect, useContext, useState } from 'react';
import { AuthContext } from '../pages/auth/Auth';
import axios from 'axios';
import { TASKS_API } from '../../constants';
import { useParams } from 'react-router-dom';
import { TaskItem } from '../items/TaskItem';

const ProjectBoard = () => {
    const { userInfo } = useContext(AuthContext);
    const { id: projectId } = useParams();
    const [userTasks, setUserTasks] = useState([]);
    const [toDoTasks, setToDoTasks] = useState([]);
    const [inProgressTasks, setInProgressTasks] = useState([]);
    const [doneTasks, setDoneTasks] = useState([]);

    useEffect(() => {
        if(userInfo.userId){
            let fetchTasks = async () => {
                try {
                    await axios
                        .get(TASKS_API, {
                            params: { project_id: projectId },
                        })
                        .then((response) => {
                            const tasks = response['data']['records'];
                            setUserTasks(tasks.filter(t => t.assignee && t.assignee.user_id === userInfo.userId));
                            setToDoTasks(tasks.filter(task => task.status === 'To Do'));
                            setInProgressTasks(tasks.filter(task => task.status === 'In Progress'));
                            setDoneTasks(tasks.filter(task => task.status === 'Done'));
                        });
                } catch (error) {
                    console.error('Error loading task:', error);
                }
            };
            fetchTasks();
        }
    }, [userInfo]);

    return (
        <Box sx={{ flexGrow: 1, margin: 2, marginX: 5 }}>
            <Grid container spacing={5}>
                <Grid item xs={12} md={3}>
                    <Paper>
                        <Box p={2}>
                            <Typography variant="h4" mb={2}>My Tasks</Typography>
                            <Paper style={{ minHeight: '100vh', maxHeight: '100vh', overflowX: 'scroll', backgroundColor: '#f0eded' }}>
                                <Box p={2} >
                                    {userTasks.length > 0 ? userTasks.map((t) => (
                                        <TaskItem key={t.id} projectId={projectId} task={t} />
                                    )):
                                        <Typography textAlign={'center'} m={4} variant='h4'>No Tasks</Typography>
                                    }
                                </Box>
                       
                            </Paper>
                        </Box>
                       
                    </Paper>
                    
                </Grid>
                <Grid item xs={12} md={9}>
                    <Paper>
                        <Box p={2}>
                            <Typography variant="h4" mb={2}>Tasks board</Typography>
                            <Grid container direction="row" spacing={4}>
                                <Grid item xs={12} md={4}>
                                    <Paper style={{ minHeight: '100vh', maxHeight: '100vh', overflowX: 'scroll', backgroundColor: '#f0eded' }}>
                                        <Box p={2}>
                                            <Typography variant="h5" mb={2}>TO DO</Typography>
                                            {toDoTasks.length > 0 ? toDoTasks.map((t) => (
                                                <TaskItem key={t.id} projectId={projectId} task={t} />
                                            )):
                                                <Typography textAlign={'center'} m={4} variant='h4'>No Tasks</Typography>
                                            }
                                        </Box>
                       
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Paper style={{ minHeight: '100vh', maxHeight: '100vh', overflowX: 'scroll', backgroundColor: '#f0eded' }}>
                                        <Box p={2}>
                                            <Typography variant="h5" mb={2}>IN PROGRESS</Typography>
                                            { inProgressTasks.length > 0 ? inProgressTasks.map((t) => (
                                                <TaskItem key={t.id} projectId={projectId} task={t} />
                                            )) : 
                                                <Typography textAlign={'center'} m={4} variant='h4'>No Tasks</Typography>
                                            }
                                        </Box>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Paper style={{ minHeight: '100vh', maxHeight: '100vh', overflowX: 'scroll', backgroundColor: '#f0eded' }}>
                                        <Box p={2}>
                                            <Typography variant="h5" mb={2}>DONE</Typography>
                                            { doneTasks.length > 0 ? doneTasks.map((t) => (
                                                <TaskItem key={t.id} projectId={projectId} task={t} />
                                            )) : 
                                               
                                                <Typography textAlign={'center'} m={4} variant='h4'>No Tasks</Typography>
                                                
                                            } 
                                            
                                        </Box>
                                    </Paper>
                                </Grid>

                            </Grid>
                            
                        </Box>
                       
                    </Paper>
                    
                </Grid>
            </Grid>
        </Box>
    );
};

export default ProjectBoard;
