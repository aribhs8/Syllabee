/* eslint-disable no-unused-vars */
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { ExpandMore as ExpandMoreIcon, Sync as RefreshIcon } from '@mui/icons-material';

import { SUGGESTIONS_API } from '../../constants';
import nullIcon from '../../assets/null.png';
import { Accordion, AccordionSummaryAlt as AccordionSummary, AccordionDetails } from '../Accordion';

import React, { useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';


const SuggestionBox = (props) => {
    const { title, description, projectId } = props;
    
    const [expanded, setExpanded] = useState(false);
    const [suggestions, setSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleAccordionChange = (e) => {
        e.preventDefault();
        setExpanded(!expanded);
    };

    const refreshSuggestions = async(e) => {
        e.preventDefault();
        setLoading(true);

        // generate keywords
        const resp = await axios.get(SUGGESTIONS_API, { params: { text: description, projectId }});
        const keywords = resp.data.keywords;
        setSuggestions(resp.data.results);
        setLoading(false);
    };

    return (
        <Accordion expanded={expanded} onChange={handleAccordionChange} sx={props.sx}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Suggestions</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ overflowY: 'auto' }}>
                {suggestions ?
                    <Box>
                        <Typography>Please see the following documents to get started with this task:</Typography>
                        <ul>
                            {suggestions.map(suggestion => {
                                return (
                                    <div key={suggestion.doc_id} style={{ marginBottom: '20px' }} >
                                        <li>
                                            <span style={{ fontWeight: 'bold' }}>{suggestion.title} </span>
                                            <Link to={`/docs/${suggestion.doc_id}`}>Go to doc</Link>
                                        </li>
                                        <Typography>{`Keywords mentioned: ${suggestion.matches.join(', ')}`}</Typography>
                                    </div>
                                );
                            })}
                        </ul>
                    </Box>
                    :
                    <EmptySuggestionsContainer handleRefresh={refreshSuggestions} refresh={loading} />
                }
            </AccordionDetails>
        </Accordion>
    );
};

SuggestionBox.propTypes = {
    sx: PropTypes.object,
    title: PropTypes.string,
    description: PropTypes.string,
    projectId: PropTypes.string
};

const EmptySuggestionsContainer = (props) => {
    const { handleRefresh, refresh } = props;

    return (
        refresh ?
            <Box display='flex' flexDirection='column' justifyContent='center' alignItems='center' minHeight='20vh' maxHeight='20vh' sx={{ mt: 4, ml: '25%', mr: '25%' }}>
                <CircularProgress sx={{ mb: 2 }} />
                <Typography>Generating Suggestions... Please Wait</Typography>
            </Box>
            :
            <Box display='flex' flexDirection='column' justifyContent='center' alignItems='center' minHeight='20vh' maxHeight='20vh' sx={{ mt: 4, ml: '25%', mr: '25%' }}>
                <img src={nullIcon} />
                <Typography gutterBottom align='center' sx={{ mt: 2 }}>We were not able to generate any suggestions for this task. Press the Refresh button to try again.</Typography>
                <Button variant='contained' startIcon={<RefreshIcon />} onClick={handleRefresh}>Refresh</Button>
            </Box>
    );
};

EmptySuggestionsContainer.propTypes = {
    handleRefresh: PropTypes.func,
    refresh: PropTypes.bool
};

export default SuggestionBox;
