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
    PictureAsPdf as PictureAsPdfIcon,
    MoreVert as MoreVertIcon
} from '@mui/icons-material';

import React, { useState } from 'react';
import { Document, Thumbnail } from 'react-pdf';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';


const DocumentItem = (props) => {
    // props
    const { document, onDelete, onEdit } = props;
    const [anchorEl, setAnchorEl] = useState(null);
    const menuOpen = Boolean(anchorEl);
    const navigate = useNavigate();
    const isPDF = document.file_url.substr(document.file_url.lastIndexOf('.') + 1) === 'pdf';

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
                <Badge badgeContent={<CheckIcon fontSize={'small'} />} color='success'>
                    <Card sx={{ width: 230 }}>
                        <CardHeader
                            avatar={<Avatar>{isPDF ? <PictureAsPdfIcon /> : <ImageIcon />}</Avatar>}
                            title={document.title}
                            titleTypographyProps={{ noWrap: true }}
                            subheader={document.is_outline ? 'Outline' : 'Other'}
                            action={<IconButton aria-label='settings' onMouseDown={(e) => e.stopPropagation()} onClick={handleMenuClick}><MoreVertIcon /></IconButton>}
                            sx={{ '& .MuiCardHeader-content': { overflow: 'hidden' }}}
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
                            {isPDF ?
                                <CardMedia sx={{ objectFit: 'cover', objectPosition: 'top left' }}>
                                    <Document file={document.file_url}>
                                        <Thumbnail pageNumber={1} renderAnnotationLayer={false} renderTextLayer={false} width={230} />
                                    </Document>
                                </CardMedia>
                                :
                                <CardMedia component='img' height='296' image={document.file_url} sx={{ objectFit: 'cover', objectPosition: 'top left' }} />
                            }
                        </CardActionArea>
                    </Card>
                </Badge>
            </Grid>
            :
            <Grid item>
                <Card sx={{ width: 230 }}>
                    <CardHeader
                        avatar={<Avatar>{isPDF ? <PictureAsPdfIcon /> : <ImageIcon />}</Avatar>}
                        title={document.title}
                        titleTypographyProps={{ noWrap: true }}
                        subheader={document.is_outline ? 'Outline' : 'Other'}
                        action={<IconButton aria-label='settings' onMouseDown={(e) => e.stopPropagation()} onClick={handleMenuClick}><MoreVertIcon /></IconButton>}
                        sx={{ '& .MuiCardHeader-content': { overflow: 'hidden' }}}
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
                        {isPDF ?
                            <CardMedia sx={{ objectFit: 'cover', objectPosition: 'top left' }}>
                                <Document file={document.file_url}>
                                    <Thumbnail pageNumber={1} renderAnnotationLayer={false} renderTextLayer={false} width='230' />
                                </Document>
                            </CardMedia>
                            :
                            <CardMedia component='img' height='296' image={document.file_url} sx={{ objectFit: 'cover', objectPosition: 'top left' }} />
                        }
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
