import { BrowserRouter } from 'react-router-dom';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { Box, Toolbar, ThemeProvider, CssBaseline } from '@mui/material';

import React, { useContext, useEffect, useRef } from 'react';

import AppBar from './components/navigation/AppBar';
import theme from './theme';
import { AuthContext } from './components/pages/auth/Auth';
import createRoutes from './components/routes';


function App() {
    const { getSession } = useContext(AuthContext);
    let connected = useRef(false);

    useEffect(() => {
        async function fetchSesion() {
            try {
                await getSession().then(() => { connected.current = true; });
            } catch (err) {
                console.error(err);
            }
           
        }

        if (!connected.current) {
            fetchSesion();
        }

    }, [getSession, connected]);
    
    return (
        <BrowserRouter>
            <CssBaseline />
            <ThemeProvider theme={theme}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Toolbar variant="dense" />
                    <Box display="flex">
                        <AppBar />

                        {createRoutes()}
                        
                    </Box>
                </LocalizationProvider>
            </ThemeProvider>
        </BrowserRouter>
    );
}

export default App;
