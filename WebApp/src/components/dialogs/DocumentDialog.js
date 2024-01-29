import {
    Box,
    Button,
    Dialog, DialogActions, DialogContent, DialogTitle,
    FormControl, FormControlLabel, FormLabel,
    Link,
    Radio, RadioGroup,
    TextField,
    Typography
} from '@mui/material';
import {
    UploadFile as UploadFileIcon,
    PictureAsPdf as PictureAsPdfIcon
} from '@mui/icons-material';

import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';


const DocumentDialog = props => {
    const { open, onClose, onUpload, editDoc } = props;

    // keep previous doc
    const prevEditDocRef = useRef(editDoc);

    const [title, setTitle] = useState('');
    const [docType, setDocType] = useState('outline');
    const [file, setFile] = useState(null);
    const [disabled, setDisabled] = useState(true);
    const [dropboxOpen, setDropboxOpen] = useState(true);
    const [dragActive, setDragActive] = useState(false);

    const inputFile = useRef(null);

    const handleClose = () => {
        setDropboxOpen(true);
        setTitle('');
        setFile(null);
        setDocType('outline');
        onClose();
    };

    const handleUpload = (e) => {
        e.preventDefault();
        handleClose();
        onUpload(title, file, docType === 'outline');
    };

    const handleFile = async (e) => {
        const fileList = e.target.files;

        if (fileList?.length > 0) {
            let f = fileList[0];

            // change state of box
            setDropboxOpen(false);
            setFile(f);
        }
    };

    const handleDrag = e => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = e => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            let f = e.dataTransfer.files[0];

            // change state of box
            setDropboxOpen(false);
            setFile(f);
        }
    };

    useEffect(() => {
        if (editDoc !== null) {
            if (prevEditDocRef.current !== editDoc) {
                setTitle(editDoc.title);
                setDocType(editDoc.is_outline ? 'outline' : 'other');
                setDropboxOpen(false);
                setFile({ name: 'File cannot be edited.' });
            }
        }

        prevEditDocRef.current = editDoc;
        setDisabled(title === '');
    }, [title, editDoc]);

    return (
        <Dialog open={open} fullWidth maxWidth={'sm'}>
            <DialogTitle>{editDoc ? 'Edit Document' : 'Upload a Document'}</DialogTitle>
            <DialogContent dividers>
                <TextField
                    fullWidth
                    label='Title'
                    variant='standard'
                    value={title}
                    onChange={e => { setTitle(e.target.value); }}
                    sx={{ mb: '30px' }}
                />

                <FormControl>
                    <FormLabel>Document Type</FormLabel>
                    <RadioGroup row value={docType} onChange={(e) => setDocType(e.target.value)}>
                        <FormControlLabel value='outline' control={<Radio />} label='Outline' />
                        <FormControlLabel value='other' control={<Radio />} label='Other' />
                    </RadioGroup>
                </FormControl>

                {
                    dropboxOpen ?
                        <Box
                            display="flex"
                            flexDirection="column"
                            alignItems="center"
                            onDragEnter={handleDrag}
                            sx={{ p: 3, border: '1px dashed grey' }}
                        >
                            <UploadFileIcon fontSize='large' />
                            <Typography mt={3}>Drag and Drop or <Link href="#" color="#0000FF" underline="hover" onClick={() => { inputFile.current.click(); }}>Choose file</Link> to upload</Typography>
                            <Typography>(.pdf, .png, .jpg)</Typography>
                            <input hidden accept=".pdf,image/*" id="file" type="file" ref={inputFile} onChange={handleFile} />
                            {dragActive && <div id="drag-file-element" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '1rem', top: '0px', right: '0px', bottom: '0px', left: '0px' }}></div>}
                        </Box>
                        :
                        <Box
                            display="flex"
                            flexDirection="column"
                            alignItems="center"
                            sx={{ p: 3, border: '1px dashed grey' }}
                        >
                            <PictureAsPdfIcon fontSize='large' />
                            <Typography mt={3}>{file.name}</Typography>
                        </Box>
                }

            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button variant='contained' onClick={handleUpload} disabled={disabled}>{editDoc ? 'Confirm' : 'Upload'}</Button>
            </DialogActions>
        </Dialog>
    );
};

DocumentDialog.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    onUpload: PropTypes.func,
    editDoc: PropTypes.object
};

export default DocumentDialog;
