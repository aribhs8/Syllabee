import { 
    Card, CardActionArea, CardContent, CardHeader,
    Chip,
    Divider,
    Grid,
    Typography
} from '@mui/material';

import { Person as PersonIcon } from '@mui/icons-material';

import { useNavigate } from 'react-router-dom';

import React from 'react';
import PropTypes from 'prop-types';
import UserAvatar from './UserAvatar';


const ProjectItem = (props) => {
    const navigate = useNavigate();

    // props
    const { project } = props;

    const handleClick = (e) => {
        e.preventDefault();
        navigate(`/projects/${project.id}`);
    };

    return (
        <Grid item>
            <Card sx={{ width: 300, height: 200 }}>
                <CardActionArea onClick={handleClick}>
                    <CardHeader
                        avatar={
                            <UserAvatar name={project.owner} />
                        }
                        title={project.title}
                        subheader={<Chip icon={<PersonIcon />} label={project.owner} sx={{ mt: 1 }} />}
                    />
                    <Divider />
                    <CardContent sx={{ height: 130, overflow: 'auto', paddingBottom: 5 }}>
                        <Typography variant="body2" color="text.secondary">
                            {project.description}
                        </Typography>
                    </CardContent>
                </CardActionArea>
            </Card>
        </Grid>
    );
};

// prop types
ProjectItem.propTypes = {
    project: PropTypes.object
};

export default ProjectItem;
