import { Box, Button, Grid, Typography } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { TabPanel } from '@mui/lab';
import { RoundedSearchField } from '../fields/SearchField';
import { HeaderGrid } from '../containers/Headers';

import { MY_PROJECTS_LABEL, MY_PROJECTS_URL, PROJECTS_API, SHARED_LABEL, SHARED_URL } from '../../constants';

import { useLocation, useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import ProjectItem from './../items/ProjectItem';
import DataBox from '../containers/DataBox';
import ProjectDialog from '../dialogs/ProjectDialog';
import { NavTabs } from '../navigation/Tabs';
import { AuthContext } from './auth/Auth';


const ProjectsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const tabs = [
        { label: MY_PROJECTS_LABEL, value: '0', path: MY_PROJECTS_URL }, 
        { label: SHARED_LABEL, value: '1', path: SHARED_URL },
        // { label: 'ALL(TEMPORARY)', value: '2', path: '/projects/temp' }
    ];

    const [triggerDialog, setDialogTrigger] = useState(false);

    const { userInfo } = useContext(AuthContext);

    useEffect(() => {
        if (location.pathname === '/projects') {
            navigate(MY_PROJECTS_URL);
        }
    }, [location, navigate]);

    return (
        <Box>
            <HeaderGrid>
                <Grid item>
                    <Typography variant="h4">Projects</Typography>
                </Grid>
                <Grid item sx={{ ml: 'auto', mr: 5 }}>
                    <RoundedSearchField id='search-projects' />
                </Grid>
            </HeaderGrid>

            <NavTabs tabs={tabs} current={location.pathname === '/projects' ? '0' : tabs.findIndex(t => t.path === location.pathname).toString()}>
                <Button component='label' variant='contained' startIcon={<AddIcon />} sx={{ mt: 3, ml: 3 }} onClick={() => setDialogTrigger(true)}>
                    New Project
                </Button>
                <TabPanel value='0'>
                    <ProjectsGrid headerParams={ { owner_id: `'${userInfo.userId}'` } } openDialog={triggerDialog} setDialog={setDialogTrigger} shared={false} />
                </TabPanel>
                
                <TabPanel value='1'>
                    <ProjectsGrid headerParams={ { owner_id: `'${userInfo.userId}'`, shared: true } } openDialog={triggerDialog} setDialog={setDialogTrigger} shared={false} />
                </TabPanel>

                <TabPanel value='2'>
                    <ProjectsGrid openDialog={triggerDialog} setDialog={setDialogTrigger} shared={false} />
                </TabPanel>
            </NavTabs>
        </Box>
    );
}; 

const ProjectsGrid = (props) => {
    const { openDialog, setDialog, headerParams } = props;

    const [projects, setProjects] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);

    const { userInfo } = useContext(AuthContext);

    const handleDialogClose = () => {
        setDialogOpen(false);
        setDialog(false);
    };

    const handleCreate = async(title, description) => {
        const obj = {
            title: title,
            description: description,
            owner: userInfo.name,
            owner_id: userInfo.userId
        };

        await axios.post(PROJECTS_API, JSON.stringify(obj), { params: { option: 'add' }});
        axios.get(PROJECTS_API, { params: { owner_id: `'${userInfo.userId}'` }}).then((res) => setProjects(res.data.records));
    };

    useEffect(() => {
        setDialogOpen(openDialog);
    }, [openDialog]);


    return (
        <DataBox data={projects} setData={setProjects} req={{ url: PROJECTS_API, headers: { params: headerParams }}}>
            <Grid container spacing={4}>
                {projects.map(project => (
                    <ProjectItem key={project.id} project={project} />
                ))}
            </Grid>
            <ProjectDialog open={dialogOpen} onClose={handleDialogClose} onSubmit={handleCreate} />
        </DataBox>
    );
};

ProjectsGrid.propTypes = {
    openDialog: PropTypes.bool,
    setDialog: PropTypes.func,
    headerParams: PropTypes.object
};


export default ProjectsPage;
