import { Box, Button, Divider, Grid, Tab, Typography } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Add as AddIcon } from '@mui/icons-material';
import { AuthContext } from './auth/Auth';
import React, { useContext, useState } from 'react';

// import { DOCS_API } from '../../constants';
import { DocumentList } from '../containers/Lists';


const DocumentsPage = () => {
    // states
    const [tab, setTab] = useState('1');
    const [showDialog, setDialog] = useState(false);

    const { userInfo } = useContext(AuthContext);

    const handleTabChange = (e, newVal) => {
        e.preventDefault();
        setTab(newVal);
       
    };

    return (
        <Box>
            <Box sx={{ ml: 4, mt: 3, mb: 3 }}>
                <Grid container>
                    <Grid item>
                        <Typography variant="h4">Documents</Typography>
                    </Grid>
                    <Grid item sx={{ ml: 'auto', mr: 5 }}>
                        <Button variant="contained" onClick={() => setDialog(true)} endIcon={<AddIcon />}>Create New</Button>
                    </Grid>
                </Grid>
            </Box>

            <TabContext value={tab}>
                <TabList onChange={handleTabChange} aria-label="Document Tabs" sx={{ ml: 3 }}>
                    <Tab label="All" value="1" />
                    <Tab label="Outlines" value="2" />
                    <Tab label="Non-outlines" value="3" />
                </TabList>

                <Divider />

                {/* Main Content */}
                <TabPanel value="1">
                    <Typography variant='h6' mb={3}>All documents you uploaded or shared with you</Typography>
                    <DocumentList headerParams={{ user_id: `'${userInfo.userId}'` }} dialog={showDialog} setDialog={setDialog} />
                </TabPanel>

                <TabPanel value="2">
                    <Typography variant='h6' mb={3}>Outlines you uploaded or shared with you</Typography>
                    <DocumentList headerParams={{ user_id: `'${userInfo.userId}'` }} dialog={showDialog} setDialog={setDialog} outline={true}/>
                </TabPanel>

                <TabPanel value="3">
                    <Typography variant='h6' mb={3}>Non-outlines you uploaded or shared with you</Typography>
                    <DocumentList headerParams={{ user_id: `'${userInfo.userId}'` }} dialog={showDialog} setDialog={setDialog} outline={false}/>
                </TabPanel>
            </TabContext>

        

        </Box>
    );
};

export default DocumentsPage;
