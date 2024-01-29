import {
    Avatar,
    Badge,
    Card, CardActionArea, CardHeader, CardMedia,
    Divider,
    Grid,
    IconButton,
    Menu, MenuItem
} from '@mui/material';
import {
    Check as CheckIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Image as ImageIcon,
    MoreVert as MoreVertIcon
} from '@mui/icons-material';

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';


const DocumentItem = (props) => {
    // props
    const { document, onDelete, onEdit } = props;
    const [anchorEl, setAnchorEl] = useState(null);
    const menuOpen = Boolean(anchorEl);
    const navigate = useNavigate();

    const handleClick = (e) => {
        e.preventDefault();
        navigate(`/docs/${document.id}`);
    };

    const handleMenuClick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        setAnchorEl(e.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleEdit = () => {
        handleMenuClose();
        onEdit(document);
    };

    const handleDelete = () => {
        handleMenuClose();
        onDelete(document.id);
    };

    return (
        document.text_url ? 
            <Grid item>
                <Badge badgeContent={<div style={{ display: 'flex', alignItems: 'center', padding: 2 }}><CheckIcon fontSize={'small'} sx={ { mr: '0.1rem' }} />Scanned</div>} color='success'>
                    <Card sx={{ width: 230 }}>
                        <CardHeader
                            avatar={<Avatar><ImageIcon /></Avatar>}
                            title={document.title}
                            subheader={document.is_outline ? 'Outline' : 'Other'}
                            action={<IconButton aria-label='settings' onMouseDown={(e) => e.stopPropagation()} onClick={handleMenuClick}><MoreVertIcon /></IconButton>}
                        />
                        <Menu
                            anchorEl={anchorEl}
                            open={menuOpen}
                            onClose={handleMenuClose}
                            transformOrigin={{ horizontal: 'left', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
                        >
                            <MenuItem onClick={handleEdit} disableRipple>
                                <EditIcon sx={{ mr: 2 }} />
                                Edit
                            </MenuItem>
                            <MenuItem onClick={handleDelete} disableRipple>
                                <DeleteIcon sx={{ mr: 2 }} />
                                Delete
                            </MenuItem>
                        </Menu>
                        <Divider />
                        <CardActionArea onClick={handleClick}>
                            <CardMedia component='img' height='194' image={document.file_url} sx={{ objectFit: 'cover', objectPosition: 'top left' }} />
                        </CardActionArea>

                    </Card>
                </Badge>
            </Grid>
            :
            <Grid item>
                <Card sx={{ width: 230 }}>
                    <CardHeader
                        avatar={<Avatar><ImageIcon /></Avatar>}
                        title={document.title}
                        subheader={document.is_outline ? 'Outline' : 'Other'}
                        action={<IconButton aria-label='settings' onMouseDown={(e) => e.stopPropagation()} onClick={handleMenuClick}><MoreVertIcon /></IconButton>}
                    />
                    <Menu
                        anchorEl={anchorEl}
                        open={menuOpen}
                        onClose={handleMenuClose}
                        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
                    >
                        <MenuItem onClick={handleEdit} disableRipple>
                            <EditIcon sx={{ mr: 2 }} />
                            Edit
                        </MenuItem>
                        <MenuItem onClick={handleDelete} disableRipple>
                            <DeleteIcon sx={{ mr: 2 }} />
                            Delete
                        </MenuItem>
                    </Menu>
                    <Divider />
                    <CardActionArea onClick={handleClick}>
                        <CardMedia component='img' height='194' image={document.file_url} sx={{ objectFit: 'cover', objectPosition: 'top left' }} />
                    </CardActionArea>

                </Card>
            </Grid>
    );
};

DocumentItem.propTypes = {
    document: PropTypes.object,
    onDelete: PropTypes.func,
    onEdit: PropTypes.func
};

export default DocumentItem;
