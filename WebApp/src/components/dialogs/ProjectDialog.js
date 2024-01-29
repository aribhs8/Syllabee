import {
    Button,
    Dialog, DialogActions, DialogContent, DialogTitle,
    TextField
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';

import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';


const ProjectDialog = (props) => {
    // props
    const { open, onClose, onSubmit, editProject } = props;

    // keep previous doc
    const prevEditProjectRef = useRef(editProject);

    // states
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [disabled, setDisabled] = useState(false);

    const handleClose = () => {
        if (editProject) {
            setTitle(editProject.title);
            setDescription(editProject.description);
        }
        else {
            setTitle('');
            setDescription('');
        }
        
        onClose();
    };

    const handleCreate = (e) => {
        e.preventDefault();
        handleClose();
        onSubmit(title, description);
    };

    const handleSubmit = e => {
        e.preventDefault();
        onClose();
        onSubmit(title, description);
    };

    useEffect(() => {
        if (editProject) {
            if (prevEditProjectRef.current !== editProject) {
                setTitle(editProject.title);
                setDescription(editProject.description);
            }
        }

        prevEditProjectRef.current = editProject;
        setDisabled(title === '');
    }, [title, editProject]);

    return (
        <Dialog open={open} fullWidth maxWidth={'sm'}>
            <DialogTitle>{editProject ? 'Edit Project' : 'Create a New Project' }</DialogTitle>
            <DialogContent dividers>
                <TextField
                    fullWidth
                    label="Title"
                    value={title}
                    variant="standard"
                    onChange={(event) => { setTitle(event.target.value); }}
                    sx={{ mb: '30px' }}
                />
                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Description"
                    value={description}
                    variant="filled"
                    onChange={(event) => { setDescription(event.target.value); }}
                    sx={{ mb: '30px' }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                {editProject ?
                    <Button onClick={handleSubmit} variant='contained' disabled={disabled} startIcon={<EditIcon />}>Confirm</Button>
                    :
                    <Button onClick={handleCreate} variant='contained' disabled={disabled} startIcon={<AddIcon />}>Create</Button>
                }
            </DialogActions>
        </Dialog>
    );
};

ProjectDialog.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    onSubmit: PropTypes.func,
    editProject: PropTypes.object
};

export default ProjectDialog;
