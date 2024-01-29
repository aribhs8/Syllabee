import React, { Fragment, useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../pages/auth/Auth';
import MainDrawer from '../navigation/MainDrawer';
import { Box } from '@mui/material';

const ProtectedRoute = () => {
    const { isLoggedIn } = useContext(AuthContext);
  
    const display = () => {
        if (isLoggedIn) {
            return (
                <Fragment>
                    <MainDrawer />
                    <Box component="main" sx={{ flexGrow: 1 }}>
                        <Outlet />
                    </Box>
                </Fragment>
            );
        } else {
            return <Navigate replace to={'/login'} />;
        }
        
    };

    return (
        display()
    );
    
};

export default ProtectedRoute;
