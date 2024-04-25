import { Divider, Tab } from '@mui/material';
import { TabContext, TabList } from '@mui/lab';
import { useNavigate } from 'react-router-dom';

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';


export const NavTabs = (props) => {
    const navigate = useNavigate();

    // props
    const { tabs, current, children } = props;
    // states
    const [tab, setTab] = useState(current);

    const handleTabChange = (e, t) => {
        e.preventDefault();
        setTab(t);
        navigate(tabs[parseInt(t)].path);
    };
    
    useEffect(() => {
        const syntheticEvent = new Event('click'); 
        handleTabChange(syntheticEvent, current);
    }, [current]);
    
    return (
        <TabContext value={tab}>
            <TabList onChange={handleTabChange} sx={{ ml: 3 }} {...props}>
                {tabs.map(tab => (
                    <Tab key={tab.value} {...tab} />
                ))}
            </TabList>
            <Divider />

            {children}
        </TabContext>
    );
};

NavTabs.propTypes = {
    tabs: PropTypes.array,
    current: PropTypes.string,
    children: PropTypes.array
};

