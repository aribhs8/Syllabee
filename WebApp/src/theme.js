import { createTheme } from '@mui/material';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#3a73a1',
            light: '#f0f0f0'
        },
        secondary: {
            main: '#f50057'
        }
    },
    components: {
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: '#f0f0f0',
                }
            }
        },
        MuiListItemButton: {
            styleOverrides: {
                root: () => ({
                    '&.Mui-selected': {
                        backgroundColor: '#f0f0f0'
                    },
                })
            }
        },
        MuiButtonBase: {
            styleOverrides: {
                root: {
                    '&.Mui-active': {
                        backgroundColor: '#c6c6c6'
                    },
                    '&& .MuiTouchRipple-rippleVisible': {
                        borderRadius: 0,
                        opacity: 0.1,
                        animationDuration: '0ms'
                    },
                    '&& .MuiTouchRipple-child': {
                        borderRadius: 0
                    }
                }
            }
        },
        MuiButtonGroup: {
            styleOverrides: {
                root: {
                    '&.Mui-active': {
                        backgroundColor: '#c6c6c6'
                    },
                    '&& .MuiTouchRipple-rippleVisible': {
                        borderRadius: 0,
                        opacity: 0.1,
                        animationDuration: '0ms'
                    },
                    '&& .MuiTouchRipple-child': {
                        borderRadius: 0
                    }
                }
            }
        },
    }
});

export default theme;
