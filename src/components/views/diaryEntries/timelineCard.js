import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {Card, CardActions, CardContent, CardHeader, IconButton, Button, Typography, Menu, MenuItem, withStyles} from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import DeleteDiaryEntry from './deleteDiaryEntry';

const styles = theme => ({
    timelineCard: {
        minWidth: 275,
        maxWidth: 575,
        overflow: 'visible',
    },
    title: {
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        maxWidth: 450, 
        '@media (max-width: 650px)': { 
            maxWidth: 435,
        },
        '@media (max-width: 550px)': { 
            maxWidth: 385,
        },
        '@media (max-width: 500px)': { 
            maxWidth: 335,
        },
        '@media (max-width: 450px)': { 
            maxWidth: 285,
        },
        '@media (max-width: 400px)': { 
            maxWidth: 235,
        },
        '@media (max-width: 350px)': { 
            maxWidth: 185,
        },
        '@media (max-width: 300px)': { 
            maxWidth: 160,
        },
    },
    timelineCardPos: {
        marginBottom: 12,
    }
});

class TimelineCard extends Component {

    constructor(props) {
        super(props);
        this.state = {
            anchorEl: null,
        }
        this.onViewButtonClick = this.onViewButtonClick.bind(this);
        this.handleMenuOpen = this.handleMenuOpen.bind(this);
        this.handleMenuClose = this.handleMenuClose.bind(this);
    }


    onViewButtonClick() {
        this.props.viewSingleEntry(this.props.index);
    } 

    handleMenuOpen = event => {
        this.setState({ anchorEl: event.currentTarget });
    };
    
    handleMenuClose = () => {
        this.setState({ anchorEl: null });
    };

    handleDelete = () => {
        this.props.deleteEntry(this.props.fileName, this.props.index);
        this.setState({
            anchorEl: null,
        });
    }

    render() {
        const entryDate = new Date(this.props.date);
        entryDate.setDate(entryDate.getDate() + 1);
        const daysAlive = Math.round((entryDate - new Date(this.props.birthDate)) / (1000 * 60 * 60 * 24));
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const readDate = months[entryDate.getMonth()] + " " + (entryDate.getDate()) + ", " + entryDate.getFullYear(); 
        const { classes } = this.props;
        const { anchorEl } = this.state;

        const textToShow = (this.props.bodyText.length < 75) ? this.props.bodyText : 
                            (this.props.bodyText.substring(0,76) + "...");

        return (
            <Card className={classes.timelineCard}>
                <CardHeader
                    action={
                        <div>
                        <IconButton onClick={this.handleMenuOpen} style={{overflow: 'visible'}}>
                            <MoreVertIcon/>
                        </IconButton>
                            <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={this.handleMenuClose}
                            >
                            <DeleteDiaryEntry handleDelete={this.handleDelete} />
                        </Menu>
                        </div>
                    }
                    title= {"Day " + daysAlive + (this.props.title ? " - " + this.props.title : " ")}
                    classes={{
                        title: classes.title,
                    }}
                    subheader={readDate}
                />  
                <CardContent>
                    <Typography component="p">
                        {textToShow}
                    </Typography>
                </CardContent>
                <CardActions>
                    <Button onClick={this.onViewButtonClick} size="small">View Entry</Button>
                </CardActions>
            </Card>
        );
    }
}

TimelineCard.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(TimelineCard);
