import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import React, { useContext, useEffect } from 'react';
import { AuthContext } from './auth/Auth';


const DashboardPage = () => {
    const navigate = useNavigate();
    const { userInfo } = useContext(AuthContext);
    useEffect(() => {
        navigate('/dashboard');
    }, [navigate]);

    return (
        <Box>
            <Typography variant='h4'>Dashboard</Typography>
            <p>{userInfo.userId} - {userInfo.name} - {userInfo.email}</p>
        </Box>
    );
};

export default DashboardPage;
