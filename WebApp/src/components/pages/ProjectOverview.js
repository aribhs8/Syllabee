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
import { OverviewItem } from '../items/TaskItem';

const ProjectOverview = () => {
    const { userInfo } = useContext(AuthContext);
    const { id: projectId } = useParams();
    const [toDoTasks, setToDoTasks] = useState([]);
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
                            tasks.sort((a, b) => a.priority - b.priority);
                            setToDoTasks(tasks.filter(task => task.status === 'To Do'));
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
            <Grid container direction="row" spacing={4}>
                <Grid item xs={12} md={4}>
                    <Paper style={{ minHeight: '100vh', maxHeight: '100vh', overflowX: 'scroll', backgroundColor: '#f0eded' }}>
                        <Box p={2}>
                            <Typography variant="h5" mb={2}>Tasks for today</Typography>
                            {toDoTasks.length > 0 ? toDoTasks.map((t) => (
                                <OverviewItem key={t.id} projectId={projectId} task={t} />

                            )):
                                <Typography textAlign={'center'} m={4} variant='h4'>No Tasks</Typography>
                            }
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ProjectOverview;
