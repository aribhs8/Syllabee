import React, { useContext, useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../pages/auth/Auth';
import { MY_PROJECTS_URL, PROJECTS_API } from '../../constants';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Backdrop, CircularProgress } from '@mui/material';

const CanViewRoute = () => {
    const { userInfo } = useContext(AuthContext);
    const [isProjectMember, setIsProjectMember] = useState(false);
    const [showBackdrop, setBackdrop] = useState(true);
    const { id: projectId } = useParams();

    useEffect(() => {
        const fetchMembers = async() => {
            const result = await axios.get(PROJECTS_API, { params: { id: projectId }});
            const members = result.data.records[0].members;
            const ownerId = result.data.records[0].owner_id;
            setIsProjectMember(members.some(member => member.user_id === userInfo.userId) || userInfo.userId === ownerId);
            setBackdrop(false);
        };

        if (userInfo && userInfo.userId) {
            fetchMembers();
        }
    }, [userInfo.userId, projectId]);
    
    if(!userInfo.userId || showBackdrop){
        return (
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={showBackdrop}
            >
                <CircularProgress color='inherit' />
            </Backdrop>
        );
    }

    return isProjectMember ? (
        <Outlet />
    ) : (
        <Navigate replace to={MY_PROJECTS_URL} />
    );
};

export default CanViewRoute;
