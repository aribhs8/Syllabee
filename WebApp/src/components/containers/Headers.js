import { Grid } from '@mui/material';
import React from 'react';
import { PropTypes } from 'prop-types';


export const HeaderGrid = ({ children }) => {
    return (
        <Grid container sx={{ p: 3 }}>
            {children}
        </Grid>
    );
};

HeaderGrid.propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.element),
        PropTypes.element.isRequired
    ])
};
