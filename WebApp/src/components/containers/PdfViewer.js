import { Box } from '@mui/material';
import { pdfjs, Document, Page } from 'react-pdf';
import React, { useState } from 'react';
import PropTypes from 'prop-types';


pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.js',
    import.meta.url
).toString();


const PdfViewer = (props) => {
    const { file_url } = props;
    const [numPages, setNumPages] = useState(null);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    return (
        <Box display="flex" justifyContent="center" mt="auto" mb="auto" sx={{ width: '100%', height: 'calc(100vh - 130px)', overflow: 'auto' }}>
            <Document file={file_url} onLoadSuccess={onDocumentLoadSuccess}>
                {Array.from(new Array(numPages), (el, index) => (
                    <Page
                        key={`page_${index + 1}`}
                        pageNumber={index + 1}
                        renderAnnotationLayer={false}
                        renderTextLayer={false}
                    />
                ))}
            </Document>
        </Box>
    );
};

PdfViewer.propTypes = {
    file_url: PropTypes.string
};

export default PdfViewer;
