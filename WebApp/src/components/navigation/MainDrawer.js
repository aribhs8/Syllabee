import { 
    Box,
    IconButton,
    Link, List, ListItem, ListItemButton, ListItemIcon, 
    ListItemText, 
    Toolbar, 
    Tooltip,
    Typography
} from '@mui/material';
import MuiDrawer from '@mui/material/Drawer';

import {
    AccountTreeOutlined as AccountTreeIcon,
    CalendarMonthOutlined as CalendarMonthIcon,
    DashboardOutlined as DashboardIcon,
    DescriptionOutlined as DescriptionIcon,
    List as ListIcon,
    Menu as MenuIcon,
} from '@mui/icons-material';

import { 
    CALENDAR_PAGE, 
    DASHBOARD_PAGE, 
    DOCUMENTS_PAGE, 
    PROJECTS_PAGE, 
    TASKS_PAGE 
} from '../../constants';

import { styled } from '@mui/material/styles';

import { Link as RouterLink, useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import theme from '../../theme';


// custom components
const drawerWidth = 230;

const openedMixin = (theme) => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
});
  
const closedMixin = (theme) => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(5)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(5.5)} + 1px)`,
    },
});
  
const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        ...(open && {
            ...openedMixin(theme),
            '& .MuiDrawer-paper': openedMixin(theme),
        }),
        ...(!open && {
            ...closedMixin(theme),
            '& .MuiDrawer-paper': closedMixin(theme),
        }),
    }),
);

const ImageMarked = styled('span')(({ theme }) => ({
    height: 30,
    width: 2,
    backgroundColor: theme.palette.primary.main,
    position: 'absolute',
    marginBottom: 'auto',
    marginTop: 'auto',
    left: 5,
    transition: theme.transitions.create('opacity'),
}));

// menus
const menu = [
    {
        label: DASHBOARD_PAGE,
        icon: <DashboardIcon fontSize='small' />,
        path: '/dashboard'
    },
    {
        label: PROJECTS_PAGE,
        icon: <AccountTreeIcon fontSize='small' />,
        path: '/projects'
    },
    {
        label: DOCUMENTS_PAGE,
        icon: <DescriptionIcon fontSize='small' />,
        path: '/docs'
    },
    {
        label: TASKS_PAGE,
        icon: <ListIcon fontSize='small' />,
        path: '/tasks'
    },
    {
        label: CALENDAR_PAGE,
        icon: <CalendarMonthIcon fontSize='small' />,
        path: '/schedule'
    }
];

const MainDrawer = () => {
    const [path, setPath] = useState('');
    const [open, setOpen] = useState(false);
    const location = useLocation();

    const activeRoute = (route) => {
        return path.startsWith(route);
    };

    useEffect(() => {
        setPath(location.pathname);
    }, [location.pathname]);

    return (
        <Drawer variant="permanent" open={open}>
            <Toolbar variant='dense' />
            <Tooltip title='Toggle Navigation' placement='right'>
                <IconButton size='small' onClick={() => setOpen(!open) } sx={{ mt: 2, width: '30px', ml: open ? 1 : 'auto', mr: 'auto', borderRadius: 0 }}>
                    <MenuIcon fontSize='small' />
                </IconButton>
            </Tooltip>
            
            <List>
                {menu.map((item) => (
                    <Link key={item.label} component={RouterLink} to={item.path} underline="none" color="inherit">
                        <ListItem disablePadding dense sx={{ display: 'block' }}>
                            <Tooltip title={open ? '' : item.label} placement='right-end'>
                                <ListItemButton sx={{ minHeight: 48, justifyContent: open ? 'initial' : 'center',  px: open ? 1.6 : 2.5 }} selected={activeRoute(item.path)}>
                                    <ListItemIcon sx={{ minWidth: 0, mr: open ? 1 : 'auto', justifyContent: 'center', color: activeRoute(item.path) ? theme.palette.primary.main : 'initial' }}>
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: activeRoute(item.path) ? 700 : 'regular' }} sx={{ opacity: open ? 1 : 0 }} />
                                    {activeRoute(item.path) && <ImageMarked /> }
                                </ListItemButton>
                            </Tooltip>
                        </ListItem>
                    </Link>
                ))}
            </List>

            {
                open &&
                <Box sx={{ alignSelf: 'center', mt: 'auto', mb: '20px' }}>
                    <Typography textAlign='center' display='block' variant='caption'>v1.2</Typography>
                    <Typography textAlign='center' display='block' variant='caption'>Currently in development</Typography>
                </Box>
            }
        </Drawer>
    );
};

export default MainDrawer;
