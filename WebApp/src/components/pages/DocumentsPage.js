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

    // const updateUI = useCallback(async (headers) => {
    //     const result = await axios.get(DOCS_API, headers);
    //     setDocuments(result.data.records);
    // }, []);


    // const handleDelete = async (id) => {
    //     setBackdropOpen(true);
    //     // delete specified document
    //     axios.post(DOCS_API, JSON.stringify({ id: id }), { params: { option: 'delete' }})
    //         .then(() => updateUI({ params: { type: 'outline' }}).then(() => setBackdropOpen(false)));
    // };


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
                    <Tab label="Outlines" value="1" />
                    <Tab label="All" value="2" />
                </TabList>

                <Divider />

                {/* Main Content */}
                <TabPanel value="1">
                    <DocumentList headerParams={{ user_id: `'${userInfo.userId}'` }} dialog={showDialog} setDialog={setDialog} />
                </TabPanel>

                <TabPanel value="2">
                    IN DEVELOPMENT
                </TabPanel>
            </TabContext>

        

        </Box>
    );
};

export default DocumentsPage;
