import { Divider } from '@mui/material';

import { useParams } from 'react-router-dom';
import React, { useState } from 'react';

import { DOCS_API } from '../../../constants';
import DataBox from '../../containers/DataBox';
import DocBar from '../../navigation/DocBar';
import OtherDocsPage from './OtherDocsPage';
import OutlineDocsPage from './OutlineDocsPage';


const DocumentDetails = () => {
    const { id: docId } = useParams();
    const [doc, setDoc] = useState(null);

    return (
        <DataBox data={doc} setData={setDoc} req={{ url: DOCS_API, headers: { params: { id: docId }}}}>
            {
                doc &&
                    <div>
                        <DocBar title={doc.title} prev_url={`/projects/${doc.project_id}/docs`} />
                        <Divider />

                        {
                            doc.is_outline ?
                                <OutlineDocsPage id={docId} file_url={doc.file_url} text_url={doc.text_url} />
                                :
                                <OtherDocsPage id={docId} file_url={doc.file_url} text_url={doc.text_url} />
                        }
                    </div>
            }
        </DataBox>
    );
};

export default DocumentDetails;
