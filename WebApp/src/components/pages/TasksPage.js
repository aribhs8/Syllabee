import { Box, Typography } from '@mui/material';
import React from 'react';
import { AuthContext } from '../pages/auth/Auth';
import { TASKS_API } from '../../constants';
import { useEffect, useContext, useState } from 'react';
import { TaskItem } from '../items/TaskItem';
import axios from 'axios';

const TasksPage = () => {
    const { userInfo } = useContext(AuthContext);
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const result = await axios.get(TASKS_API, { params: { user_id: userInfo.userId }});
                setTasks(result.data.records);
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
            <Box sx={{ m: 4, mt: 3 }}>
                <Typography variant="h4" mb={2}>My Tasks</Typography>
                <Typography variant="h8">All the tasks assigned to you across all projects</Typography>
                <Box mt={2} >
                    {tasks.length > 0 ? tasks.map((t) => (
                        <TaskItem key={t.id} projectId={t.project_id.toString()} task={t} />
                    )):
                        <Typography textAlign={'center'} m={4} variant='h4'>No Tasks</Typography>
                    }
                </Box>
            </Box>
        </Box>
    );
};

export default TasksPage;
