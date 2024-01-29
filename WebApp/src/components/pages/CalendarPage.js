import { Box } from '@mui/material';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Calendar, momentLocalizer } from 'react-big-calendar';

import moment from 'moment';
import React from 'react';


const CalendarPage = () => {
    //for end date, add an extra day to include it in the calendar and months start from 0-11
    const localizer = momentLocalizer(moment);
    const myEvents = [
        {
            start: new Date(2023, 6, 3),
            end: new Date(2023, 6, 7),
            title: '458 Assignment',
            allDay: false,
        },
        {
            start: new Date(2023, 6, 3),
            end: new Date(2023, 6, 5),
            title: '457A Lab',
            allDay: false,
        },
        {
            start: new Date(2023, 6, 18),
            end: new Date(2023, 6, 20),
            title: 'MSCI 331 Project',
            allDay: true,
        },
    ];

    return (
        <Box ml={5} mr={5} height="80%" m={5}>
            <Calendar
                localizer={localizer}
                events={myEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 700 }}
            />
        </Box>
    );
};

export default CalendarPage;
