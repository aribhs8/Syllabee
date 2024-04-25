import React, { useEffect, useContext, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { AuthContext } from './auth/Auth';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import axios from 'axios';
import { TASKS_API } from '../../constants';
import { TaskItem } from '../items/TaskItem';


const DashboardPage = () => {
    const { userInfo } = useContext(AuthContext);
    const [tasks, setTasks] = useState([]);
    const [doneTasks, setDoneTasks] = useState([]);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const result = await axios.get(TASKS_API, { params: { user_id: userInfo.userId, rec: true }});
                // result.sort((a, b) => a.priority - b.priority);
                setTasks(result.data.records);
                var todaysDate = new Date().toISOString().slice(0, 10);
                setDoneTasks(result.data.records.filter(task => task.completion_date === todaysDate));
            } catch (error) {
                console.error('Error loading task: ', error);
            }
        };

        if (userInfo.userId) {
            fetchTasks();
        }

    }, [userInfo]);

    return (
        <Box>
            <Box sx={{ ml: 4, mt: 3 }}>
                <Grid container>
                    <Grid item>
                        <Typography variant="h4">Dashboard</Typography>
                        <Typography variant="h5" mb={2}>Welcome, {userInfo.name}</Typography>
                    </Grid>
                </Grid>
            </Box>

            <Box p={2}>
                <Grid container direction="row" spacing={4}>
                    <Grid item xs={12} md={4}>
                        <Paper style={{ minHeight: '100vh', maxHeight: '100vh', overflowX: 'scroll', backgroundColor: '#f0eded' }}>
                            <Box p={2}>
                                <Typography variant="h5" mb={2}>Recommended tasks</Typography>
                                {tasks.length > 0 ? tasks.map((t) => (
                                    <TaskItem key={t.id} projectId={t.project_id.toString()} task={t} />
                                )):
                                    <Typography textAlign={'center'} m={4} variant='h4'>No Tasks</Typography>
                                }
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper style={{ minHeight: '100vh', maxHeight: '100vh', overflowX: 'scroll', backgroundColor: '#f0eded' }}>
                            <Box p={2}>
                                <Typography variant="h5" mb={2}>Completed tasks</Typography>
                                {doneTasks.length > 0 ? doneTasks.map((t) => (
                                    <TaskItem key={t.id} projectId={t.project_id.toString()} task={t} />
                                )):
                                    <Typography textAlign={'center'} m={4} variant='h4'>No Tasks</Typography>
                                }
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default DashboardPage;
