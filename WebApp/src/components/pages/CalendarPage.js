import {
    Accordion, AccordionActions, AccordionDetails, AccordionSummary,
    Box,
    Button,
    Dialog, DialogActions, DialogContent, DialogTitle,
    TextField,
    Typography
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, IosShare as IosShareIcon } from '@mui/icons-material';
import { AuthContext } from '../pages/auth/Auth';
import { CALENDAR_API, TASKS_API } from '../../constants';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import React, { useEffect, useContext, useState } from 'react';
import moment from 'moment';
import axios from 'axios';
import PropTypes from 'prop-types';
import 'react-big-calendar/lib/css/react-big-calendar.css';


const ExportDialog = (props) => {
    const { open, onClose, file, setRevoke } = props;

    const handleClose = () => {
        onClose();
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(file);
        handleClose();
    };

    const handleRevoke = () => {
        setRevoke(true);
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth='lg'>
            <DialogTitle>Export Calendar</DialogTitle>
            <DialogContent dividers>
                <Typography>Copy this URL and paste into your 3rd party email/calendar client (Gmail for example) to view your events in an external calendar.</Typography>
                <Typography gutterBottom>{'For Gmail, go to \'Settings\', then \'Add calendar\', then \'From URL\' and paste the following URL:'}</Typography>

                <TextField
                    variant='filled'
                    label='iCal Feed'
                    fullWidth
                    multiline
                    disabled
                    sx={{ mt: 2 }}
                    value={file}
                />

                <Accordion sx={{ mt: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>You can revoke/regenerate the current calendar URL:</AccordionSummary>
                    <AccordionDetails>
                        You can revoke the current calendar URL to stop other applications accessing your calendar. Click the following button to revoke the current URL and generate a new one.
                    </AccordionDetails>
                    <AccordionActions>
                        <Button color='error' variant='contained' onClick={handleRevoke}>Revoke and regenerate calendar URL</Button>
                    </AccordionActions>
                </Accordion>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} variant='outlined'>Cancel</Button>
                <Button onClick={handleCopy} variant='contained'>Copy iCal URL</Button>
            </DialogActions>
        </Dialog>
    );
};

ExportDialog.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    file: PropTypes.string,
    setRevoke: PropTypes.func
};


const CalendarPage = () => {
    const { userInfo } = useContext(AuthContext);
    const [events, setEvents] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [showDialog, setDialog] = useState(false);
    const [file, setFile] = useState('');
    const [revoke, setRevoke] = useState(false);

    const localizer = momentLocalizer(moment);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const result = await axios.get(TASKS_API, { params: { user_id: userInfo.userId }});
                const t = result.data.records.map(r => ({ title: r.title, start: r.date }));
                setTasks(t);
                
                const e = result.data.records.map((r) => {
                    return {
                        title: (
                            <div style={{ textOverflow: 'ellipsis', width: 2 }}>
                                <div>{r.title}</div>
                                <div>Project: {r.project_title}</div>
                            </div>
                        ),
                        start: new Date(r.date), end: new Date(r.date), allDay: true
                    };
                });
                setEvents(e);
            } catch (error) {
                console.error('Error loading task: ', error);
            }
        };

        const fetchCal = async () => {
            const result = await axios.get(CALENDAR_API, { params: { user_id: userInfo.userId }});
            setFile(result.data.file_url);
        };

        if (userInfo.userId) {
            if (tasks.length === 0)
                fetchTasks();
            if (file === '')
                fetchCal();
            if (revoke) {
                generateICS(true);
                setRevoke(false);
            }
        } else {
            console.error('Not signed in');
        }
    }, [userInfo, revoke]);

    const eventPropGetter = () => {
        return {
            style: {
                backgroundColor: 'lightgrey', // Change to your desired grey color
                borderRadius: '8px',
                display: 'block',
                color: 'black', // Change text color if needed
                whiteSpace: 'normal', // Allow text to wrap
            },
        };
    };

    const generateICS = async () => {
        const obj = { params: { userId: userInfo.userId, events: tasks, filename: file, revoke: revoke }};
        const result = await axios.post(CALENDAR_API, JSON.stringify(obj));
        setFile(result.data.file_url);
        setDialog(true);
    };


    return (
        <Box display='flex' flexDirection='column' ml={5} mr={5} m={5}>
            <Calendar
                localizer={localizer}
                events={events}
                eventPropGetter={eventPropGetter}
                startAccessor='start'
                endAccessor='end'
                showAllEvents={true}
                style={{ height: 750 }}
            />
            <Button startIcon={<IosShareIcon sx={{ mb: 0.5 }} />} variant='contained' sx={{ mt: 5 }} onClick={generateICS}>Export Calendar</Button>
            <ExportDialog open={showDialog} onClose={() => setDialog(false)} file={file} setRevoke={setRevoke} />
        </Box>
    );
};

export default CalendarPage;
