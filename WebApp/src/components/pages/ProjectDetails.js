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
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    ViewKanban as ViewKanbanIcon,
    Timeline as TimelineIcon,
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
    PROJECT_TIMELINE,
} from '../../constants';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import DataBox from '../containers/DataBox';
import { AuthContext } from './auth/Auth';
import ProjectDialog from '../dialogs/ProjectDialog';

const ProjectDetails = () => {
    const { id: projectId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { userInfo } = useContext(AuthContext);

    const [showProjectDialog, setProjectDialog] = useState(false);
    const [project, setProject] = useState(null);
    const [showDocsDialog, setDocsDialog] = useState(false);
    const [showMembersDialog, setMembersDialog] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const menuOpen = Boolean(anchorEl);

    const tabs = [
        {
            label: PROJECT_OVERVIEW,
            value: '0',
            icon: <DashboardIcon />,
            sx: { width: '100px' },
            path: `/projects/${projectId}/overview`,
        },
        {
            label: PROJECT_BOARD,
            value: '1',
            icon: <ViewKanbanIcon />,
            sx: { width: '100px' },
            path: `/projects/${projectId}/board`,
        },
        {
            label: PROJECT_TIMELINE,
            value: '2',
            icon: <TimelineIcon />,
            sx: { width: '100px' },
            path: `/projects/${projectId}/timeline`,
        },
        {
            label: PROJECT_TASKS,
            value: '3',
            icon: <TaskAltIcon />,
            sx: { width: '100px' },
            path: `/projects/${projectId}/tasks`,
        },
        {
            label: PROJECT_DOCS,
            value: '4',
            icon: <DescriptionIcon />,
            sx: { width: '100px' },
            path: `/projects/${projectId}/docs`,
        },
        {
            label: PROJECT_MEMBERS,
            value: '5',
            icon: <PersonIcon />,
            sx: { width: '100px' },
            path: `/projects/${projectId}/members`,
        },
    ];

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
        }
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
                            <MenuItem onClick={() => setMembersDialog(true)} disableRipple>
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
                current={
                    location.pathname === `/projects/${projectId}`
                        ? '0'
                        : tabs.findIndex((t) => t.path === location.pathname).toString()
                }
            >
                <TabPanel value="0">Overview Page</TabPanel>
                <TabPanel value="1">Kanban Board</TabPanel>
                <TabPanel value="2">Timeline Page</TabPanel>
                <TabPanel value="3">
                    <TaskList headerParams={{ project_id: projectId }} />
                </TabPanel>
                <TabPanel value="4">
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
                <TabPanel value="5">
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
        </DataBox>
    );
};

export default ProjectDetails;
