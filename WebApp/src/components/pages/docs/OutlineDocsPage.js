import { Alert, Box, Button, Collapse, Divider, LinearProgress, Paper, Skeleton, Typography } from '@mui/material';
import { Search as SearchIcon, Save as SaveIcon } from '@mui/icons-material';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

import { GEN_TASKS_FN, READ_DOCS_FN, SAVE_TASKS_API, TASKS_API } from '../../../constants';
import { Accordion, AccordionDetails, AccordionSummary } from '../../Accordion';
import { ScannedItem } from '../../items/TaskItem';
import PdfViewer from '../../containers/PdfViewer';
import ScanDialog from '../../dialogs/ScanDialog';


const FullButton = (props) => {
    const { children } = props;

    return (
        <Button
            variant="contained"
            fullWidth disableElevation disableRipple
            {...props}
        >
            {children}
        </Button>
    );
};

FullButton.propTypes = {
    children: PropTypes.object
};

const OutlineDocsPage = (props) => {
    const { id, file_url, text_url } = props;
    const [infoAlert, setInfoAlert] = useState(false);

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
                        <Paper square elevation={5} sx={{ alignSelf: 'center', padding: 3, height: '800px', width: '700px', mt: 3 }}>
                            <img src={file_url} alt='document' style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </Paper>
                }
            </Box>

            <Divider orientation='vertical' />

            <Box display='flex' flexDirection='column' width='30vw'>
                <Collapse in={infoAlert}>
                    <Alert severity='info' sx={{ m: 2 }}>
                        This document has been scanned before
                    </Alert>
                </Collapse>

                <ScanTasksPanel id={id} file_url={file_url} />
                <AllTasksPanel id={id} />
            </Box>
        </Box>
    );
};

OutlineDocsPage.propTypes = {
    id: PropTypes.string,
    file_url: PropTypes.string,
    text_url: PropTypes.string
};

const ScanTasksPanel = (props) => {
    const { id, file_url } = props;
    const [scannedTasks, setScannedTasks] = useState([]);
    const [saved, setSaved] = useState(true);
    const [loading, setLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('');
    const [showDialog, setDialog] = useState(false);

    const handleSave = async() => {
        await axios.post(SAVE_TASKS_API, JSON.stringify({ scannedTasks }));
        setSaved(true);
    };

    const handleScan = async (protocol) => {
        setLoading(true);
        setDialog(false);

        let task_response = null;

        if (protocol === 'gpt') {
            const filename = file_url.split('amazonaws.com/documents/')[1];
            setLoadingText('Extracting text from file...');

            const text_response = await axios.get(READ_DOCS_FN, { params: { filename: filename, id: id }});
            const text = text_response.data.text;

            setLoadingText('Extracting tasks from text...');
            task_response = await axios.get(GEN_TASKS_FN, { params: { text: text, protocol: protocol }});

        } else {
            setLoadingText('Extracting tasks from text...');
            task_response = await axios.get(GEN_TASKS_FN, { params: { file_url: file_url, protocol: protocol, id: id }});
        }

        setScannedTasks(task_response.data.tasks);
        setLoading(false);
        setSaved(task_response.data.tasks.length > 0 ? false : true);
        setLoadingText('');
    };

    return (
        <Accordion {...props}>
            <AccordionSummary id="panel1d-header" aria-controls="panel1d-content">
                <Typography>Scan for Tasks</Typography>
            </AccordionSummary>
            <AccordionDetails>
                {
                    scannedTasks.length > 0 ?
                        <div>
                            {scannedTasks.map(task => <ScannedItem key={task.title} title={task.title} date={task.date} />)}
                            {!saved && <FullButton startIcon={<SaveIcon />} sx={{ mt: 2 }} color='success' onClick={handleSave}>Save</FullButton>}
                            <FullButton startIcon={<SearchIcon />} sx={{ mt: 2, mb: 2 }} onClick={() => setDialog(true)}>Scan</FullButton>
                        </div>
                        :
                        loading ?
                            <div>
                                <LinearProgress />
                                <Typography>{loadingText}</Typography>
                            </div>
                            :
                            <div>
                                <Typography variant="body2">Press the scan button below to scan the document for tasks.</Typography>
                                <FullButton startIcon={<SearchIcon />} sx={{ mt: 2, mb: 2 }} onClick={() => setDialog(true)}>Scan</FullButton>
                            </div>
                }
            </AccordionDetails>

            <ScanDialog open={showDialog} onClose={handleScan} />
        </Accordion>
    );
};

ScanTasksPanel.propTypes = {
    id: PropTypes.string,
    file_url: PropTypes.string
};

const AllTasksPanel = (props) => {
    const { id } = props;

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTasks = useCallback(async () => {
        setLoading(true);

        const result = await axios.get(TASKS_API, { params: { outline_id: id }});
        const sortedTasks = result.data.records.sort((a, b) => a.title > b.title ? 1 : -1);

        setTasks(sortedTasks);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchTasks();
    }, []);

    return (
        <Accordion {...props}>
            <AccordionSummary id="panel1d-header" aria-controls="panel1d-content">
                <Typography>Tasks Created</Typography>
            </AccordionSummary>
            <AccordionDetails>
                {
                    tasks.length > 0 ?
                        tasks.map(task => <ScannedItem key={task.title} title={task.title} date={task.date} />)
                        :
                        loading ?
                            [...Array(5).keys()].map((i) => <Skeleton key={i} variant='rounded' height={40} width='100%' sx={{ mb: 1 }} />)
                            :
                            <Typography variant="body2">Tasks originating from this document will appear here.</Typography>
                }
            </AccordionDetails>
        </Accordion>
    );
};

AllTasksPanel.propTypes = {
    id: PropTypes.string
};

export default OutlineDocsPage;
