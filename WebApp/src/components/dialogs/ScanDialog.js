import { 
    Card, CardActionArea, CardContent, CardMedia,
    Dialog, DialogContent, DialogContentText, DialogTitle,
    Grid,
    Typography
} from '@mui/material';

import React from 'react';
import PropTypes from 'prop-types';


const CustomCard = (props) => {
    const { card, title, description, img } = props;
    const handleClick = props.onClick;

    return (
        <Card sx={{ width: '80vw', maxWidth: 250, mb: 1 }}>
            <CardActionArea onClick={(e) => {handleClick(e, card);}}>
                <CardMedia 
                    component="img"
                    style={{ height: 200, objectFit: 'contain' }}
                    image={img}
                    alt="Technology"
                />
                <CardContent sx={{ height: 100, pb: 15 }}>
                    <Typography gutterBottom variant="h5" component="div">
                        {title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {description}
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

const ScanDialog = (props) => {
    const { open } = props;
    const handleClose = props.onClose;

    const handleCardClick = (e, idx) => {
        e.preventDefault();

        if (idx === 1) {
            handleClose('textract');
        } else if (idx === 2) {
            handleClose('gpt');
        }
    };

    return (
        <Dialog open={open} onClose={() => { handleClose(null); }} fullWidth maxWidth="sm">
            <DialogTitle>Scan For Tasks</DialogTitle>
            <DialogContent dividers sx={{ pb: 5 }}>
                <DialogContentText mb={2}>Please specify technology to use for extracting tasks from document.</DialogContentText>

                <Grid container spacing={5} justifyContent={'center'}>
                    <Grid item>
                        <CustomCard
                            card={1}
                            title="AWS Form Parser" 
                            description="Preferable when dealing with tabulated data. Looks at table cells."
                            img={require('../../assets/aws-textract.png')}
                            onClick={handleCardClick}
                        />
                    </Grid>
                    <Grid item>
                        <CustomCard
                            card={2}
                            title="GPT Parser" 
                            description="Use GPT to look for tasks present in unstructured text."
                            img={require('../../assets/GPT.png')}
                            onClick={handleCardClick}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
        </Dialog>
    );
};

// prop types
CustomCard.propTypes = {
    card: PropTypes.number,
    title: PropTypes.string,
    description: PropTypes.string,
    img: PropTypes.string,
    onClick: PropTypes.func
};
ScanDialog.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func
};

export default ScanDialog;
