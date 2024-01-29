import {
    Toolbar,
    IconButton,
    Typography,
} from '@mui/material';
import { ChevronLeft as ChevronLeftIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import React from 'react';
import PropTypes from 'prop-types';


const DocBar = (props) => {
    const { title, prev_url } = props;
    const navigate = useNavigate();

    const handleBackClick = e => {
        e.preventDefault();
        navigate(prev_url);
    };

    return (
        <Toolbar>
            <IconButton onClick={handleBackClick}>
                <ChevronLeftIcon />
            </IconButton>
            <Typography variant="h6" ml={2}>
                {title}
            </Typography>
        </Toolbar>
    );
};

DocBar.propTypes = {
    title: PropTypes.string,
    prev_url: PropTypes.string
};

export default DocBar;
