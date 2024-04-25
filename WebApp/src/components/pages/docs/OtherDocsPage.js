import { Alert, Box, Button, CircularProgress, Collapse, Divider, IconButton, Paper, Typography } from '@mui/material';
import { Close as CloseIcon, Search as SearchIcon } from '@mui/icons-material';

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

import { READ_DOCS_FN } from '../../../constants';
import PdfViewer from '../../containers/PdfViewer';


const OtherDocsPage = (props) => {
    const { id, file_url, text_url } = props;
    const [loading, setLoading] = useState(false);
    const [infoAlert, setInfoAlert] = useState(false);
    const [successAlert, setSuccessAlert] = useState(false);

    const handleScan = e => {
        e.preventDefault();
        setLoading(true);

        const filename = file_url.split('amazonaws.com/documents/')[1];
        axios.get(READ_DOCS_FN, { params: { filename, id: id }}).then(() => setLoading(false));
        setSuccessAlert(true);
    };

    const isPDF = (url) => {
        const lowerCaseUrl = url.toLowerCase();
        return lowerCaseUrl.endsWith('.pdf');
    };

    useEffect(() => {
        setInfoAlert(text_url ? true : false);
    }, [text_url]);

    return (
        <Box display='flex' height='calc(100vh - 130px)'>
            <Box display='flex' flexGrow={1} flexDirection='column'>
                {
                    isPDF(file_url) ?
                        <PdfViewer file_url={file_url} />
                        :
                        <Paper square elevation={5} sx={{ alignSelf: 'center', padding: 3, height: '800px', width: '70vw', mt: 3 }}>
                            <img src={file_url} alt='document' style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </Paper>
                }
            </Box>

            <Divider orientation='vertical' />

            {loading ?
                <LoadingPane />
                :
                <Box display='flex' flexDirection='column' width='30vw'>
                    <Collapse in={infoAlert}>
                        <Alert severity='info' sx={{ ml: 2, mr: 2, mt: 2 }}>
                            This document has been scanned before
                        </Alert>
                    </Collapse>
                    <Collapse in={successAlert}>
                        <Alert severity='success' sx={{ m: 2 }}
                            action={
                                <IconButton size='small' color='inherit' onClick={() => setSuccessAlert(false)}><CloseIcon fontSize='inherit' /></IconButton>}>
                            Scan Successful!
                        </Alert>
                    </Collapse>

                    <Box display='flex' flexDirection='column' flexGrow={1} justifyContent='center'>
                        <Button startIcon={<SearchIcon />} onClick={handleScan} variant='contained' style={{ alignSelf: 'center' }}>Scan</Button>
                    </Box>
                </Box>
            }
        </Box>
    );
};

OtherDocsPage.propTypes = {
    id: PropTypes.string,
    file_url: PropTypes.string,
    text_url: PropTypes.string
};

const LoadingPane = () => {
    return (
        <Box display='flex' flexDirection='column' width='30vw'>
            <Box display='flex' flexDirection='column' flexGrow={1} justifyContent='center' alignItems='center'>
                <CircularProgress />
                <Typography variant='subtitle1' mt={3}>Extracting text from file...</Typography>
            </Box>
        </Box>
    );
};

export default OtherDocsPage;
