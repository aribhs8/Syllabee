import { InputAdornment, TextField } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import React from 'react';
import PropTypes from 'prop-types';


export const RoundedSearchField = (props) => {
    const { id, placeholder, size, sx } = props;

    return (
        <TextField 
            id={id} 
            placeholder={placeholder? placeholder : 'Search'} 
            size={size? size : 'small'} 
            InputProps={{
                startAdornment: (
                    <InputAdornment position='start'>
                        <SearchIcon />
                    </InputAdornment>
                ),
                style: { borderRadius: '50px' }
            }}
            sx={sx}
        />
    );
};

// props validation
RoundedSearchField.propTypes = {
    id: PropTypes.string,
    placeholder: PropTypes.string,
    size: PropTypes.string,
    sx: PropTypes.object
};
