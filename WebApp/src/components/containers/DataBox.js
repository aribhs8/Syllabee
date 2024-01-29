import { Backdrop, Box, CircularProgress } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { AuthContext } from '../pages/auth/Auth';


const DataBox = (props) => {
    // props
    const { children, data, setData, req, sx } = props;

    const { userInfo } = useContext(AuthContext);

    // states
    const [showBackdrop, setBackdrop] = useState(true);

    useEffect(() => {
        const getData = async () => {
            const result = await axios.get(req.url, req.headers);
            if(result.data.id){
                // single record i.e get project details
                if(result.data.members){
                    setData(result.data.records);
                } else{
                    setData(result.data.records[0]);
                }
                
            } else {
                // get projects
                setData(result.data.records);
            }
            setBackdrop(false);
        };
        getData();
        setBackdrop(data ? data.length === 0 : false);
    }, [userInfo]);

    return (
        <Box sx={sx}>
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={showBackdrop}
            >
                <CircularProgress color='inherit' />
            </Backdrop>

            {children}
        </Box>
    );
};

DataBox.propTypes = {
    children: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    data: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    setData: PropTypes.func,
    req: PropTypes.object,
    sx: PropTypes.object
};

export default DataBox;
