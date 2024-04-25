import {
    Box,
    Breadcrumbs,
    Grid,
    IconButton,
    Fab,
    Link,
    Menu,
    MenuItem,
    Typography,
    Button,
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    ViewKanban as ViewKanbanIcon,
    // Timeline as TimelineIcon,
    TaskAlt as TaskAltIcon,
    Description as DescriptionIcon,
    MoreVert as MoreVertIcon,
    Share as ShareIcon,
    Person as PersonIcon,
    Upload as UploadIcon,
    GroupAdd as AddPersonIcon,
    ExitToApp as LeaveIcon,
} from '@mui/icons-material';
import { TabPanel } from '@mui/lab';
import { HeaderGrid } from '../containers/Headers';
import { NavTabs } from '../navigation/Tabs';
import { DocumentList, TaskList, MembersList } from '../containers/Lists';
import {
    MY_PROJECTS_URL,
    PROJECTS_API,
    PROJECT_BOARD,
    PROJECT_DOCS,
    PROJECT_MEMBERS,
    PROJECT_OVERVIEW,
    PROJECT_TASKS,
    // PROJECT_TIMELINE,
} from '../../constants';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import DataBox from '../containers/DataBox';
import { AuthContext } from './auth/Auth';
import ProjectDialog from '../dialogs/ProjectDialog';
import ProjectOverview from './ProjectOverview';
import ProjectBoard from './ProjectBoard';
import TaskDialog from '../dialogs/TaskDialog';

const ProjectDetails = () => {
    const { id: projectId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { userInfo } = useContext(AuthContext);

    const tabs = [
        {
            label: PROJECT_OVERVIEW,
            value: '0',
            icon: <DashboardIcon />,
            sx: { width: '20vw' },
            path: `/projects/${projectId}/overview`,
        },
        {
            label: PROJECT_BOARD,
            value: '1',
            icon: <ViewKanbanIcon />,
            sx: { width: '20vw' },
            path: `/projects/${projectId}/board`,
        },
        // {
        //     label: PROJECT_TIMELINE,
        //     value: '2',
        //     icon: <TimelineIcon />,
        //     sx: { width: '100px' },
        //     path: `/projects/${projectId}/timeline`,
        // },
        {
            label: PROJECT_TASKS,
            value: '2',
            icon: <TaskAltIcon />,
            sx: { width: '20vw' },
            path: `/projects/${projectId}/tasks`,
        },
        {
            label: PROJECT_DOCS,
            value: '3',
            icon: <DescriptionIcon />,
            sx: { width: '20vw' },
            path: `/projects/${projectId}/docs`,
        },
        {
            label: PROJECT_MEMBERS,
            value: '4',
            icon: <PersonIcon />,
            sx: { width: '20vw' },
            path: `/projects/${projectId}/members`,
        },
    ];

    const [showProjectDialog, setProjectDialog] = useState(false);
    const [project, setProject] = useState(null);
    const [showDocsDialog, setDocsDialog] = useState(false);
    const [showMembersDialog, setMembersDialog] = useState(false);
    const [showAddTaskDialog, setShowAddTaskDialog] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [currentTab, setCurrentTab] = useState(location.pathname === `/projects/${projectId}` ? '0' : tabs.findIndex((t) => t.path === location.pathname).toString());
    const menuOpen = Boolean(anchorEl);

   

    const handleMenuClick = (e) => {
        setAnchorEl(e.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleDelete = () => {
        handleMenuClose();

        const obj = { id: projectId };
        axios
            .post(PROJECTS_API, JSON.stringify(obj), { params: { option: 'delete' }})
            .then(() => {
                navigate(MY_PROJECTS_URL);
            });
    };

    const handleSubmit = async (title, desc) => {
        const obj = {
            id: projectId,
            title: title,
            description: desc,
        };

        await axios.post(PROJECTS_API, JSON.stringify(obj), {
            params: { option: 'edit' },
        });
        const result = await axios.get(PROJECTS_API, { params: { id: projectId }});
        setProject(result.data.records[0]);
    };

    useEffect(() => {
        if (location.pathname === `/projects/${projectId}`) {
            navigate(`/projects/${projectId}/overview`);
            return;
        }
        setCurrentTab(tabs.findIndex((t) => t.path === location.pathname).toString());
    }, [location, navigate, projectId]);

    return (
        <DataBox
            data={project}
            setData={setProject}
            req={{ url: PROJECTS_API, headers: { params: { id: projectId }}}}
        >
            <HeaderGrid>
                <Box width="100%" mb={2}>
                    <Grid item>
                        <Breadcrumbs aria-label="breadcrumb">
                            <Link underline="hover" color="inherit" href={MY_PROJECTS_URL}>
                                Projects
                            </Link>
                            <Typography color="text.primary">
                                {project && project.title}
                            </Typography>
                        </Breadcrumbs>
                    </Grid>
                </Box>
                <Grid item>
                    <Typography variant="h4">{project && project.title}</Typography>
                </Grid>
                {userInfo.userId === project?.owner_id && (
                    <Grid item ml="auto">
                        <IconButton onClick={() => setProjectDialog(true)}>
                            <EditIcon />
                        </IconButton>
                        <IconButton onClick={handleMenuClick}>
                            <MoreVertIcon />
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={menuOpen}
                            onClose={handleMenuClose}
                            PaperProps={{
                                style: {
                                    width: '20ch',
                                },
                            }}
                        >
                            <MenuItem onClick={() => {
                                setMembersDialog(true);
                                setCurrentTab('5');
                                handleMenuClose();
                            }} disableRipple>
                                <ShareIcon sx={{ mr: 2 }} />
                                Share
                            </MenuItem>
                            <MenuItem onClick={handleDelete} disableRipple>
                                <DeleteIcon sx={{ mr: 2 }} />
                                Delete
                            </MenuItem>
                        </Menu>
                    </Grid>
                )}
            </HeaderGrid>

            <NavTabs
                centered
                tabs={tabs}
                current={currentTab}
            >
                <TabPanel value="0">
                    <ProjectOverview />
                </TabPanel>
                <TabPanel value="1">
                    <ProjectBoard />
                </TabPanel>
                <TabPanel value="2">
                    <Button variant="contained" style={{ alignContent: 'right', marginBottom: '2rem' }} onClick={() => setShowAddTaskDialog(true)}>Add Task</Button>
                    <TaskList headerParams={{ project_id: projectId }} />
                </TabPanel>
                <TabPanel value="3">
                    <DocumentList
                        headerParams={{ project_id: projectId }}
                        dialog={showDocsDialog}
                        setDialog={setDocsDialog}
                    />
                    <Fab
                        color="secondary"
                        sx={{ position: 'fixed', bottom: 40, right: 40 }}
                        onClick={() => setDocsDialog(true)}
                    >
                        <UploadIcon />
                    </Fab>
                </TabPanel>
                <TabPanel value="4">
                    <MembersList
                        headerParams={{
                            id: projectId,
                            members: true,
                            ownerId: project?.owner_id,
                        }}
                        dialog={showMembersDialog}
                        setDialog={setMembersDialog}
                    />
                    {project?.owner_id === userInfo.userId ? (
                        <Fab
                            color="secondary"
                            sx={{ position: 'fixed', bottom: 40, right: 40 }}
                            onClick={() => setMembersDialog(true)}
                        >
                            <AddPersonIcon />
                        </Fab>
                    ) : (
                        <Fab
                            color="secondary"
                            sx={{ position: 'fixed', bottom: 40, right: 40 }}
                            onClick={() => setMembersDialog(true)}
                        >
                            <LeaveIcon />
                        </Fab>
                    )}
                </TabPanel>
            </NavTabs>
            <ProjectDialog
                open={showProjectDialog}
                onClose={() => {
                    setProjectDialog(false);
                }}
                editProject={project}
                onSubmit={handleSubmit}
            />
            <TaskDialog 
                open={showAddTaskDialog}
                onClose={() => {
                    setShowAddTaskDialog(false);
                }} 
            />
        </DataBox>
    );
};

export default ProjectDetails;
