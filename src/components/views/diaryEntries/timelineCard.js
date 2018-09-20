import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {Card, CardActions, CardContent, CardHeader, IconButton, Button, Typography, withStyles} from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';

const styles = theme => ({
    timelineCard: {
        minWidth: 275,
        maxWidth: 575,
    },
    timelineCardTitle: {
        marginBottom: 16,
        fontSize: 14,
    },
    timelineCardPos: {
        marginBottom: 12,
    }
});

class TimelineCard extends Component {

    constructor(props) {
        super(props);
        this.onViewButtonClick = this.onViewButtonClick.bind(this);
    }


    onViewButtonClick() {
        this.props.viewSingleEntry(this.props.fileName, this.props.index, this.props.title, this.props.date, 
                                   this.props.mood, this.props.weather, this.props.bodyText, this.props.todos, 
                                   this.props.tallies);
    } 

    render() {
        const entryDate = new Date(this.props.date);
        const daysAlive = Math.round((entryDate - new Date(this.props.birthDate)) / (1000 * 60 * 60 * 24));
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const readDate = months[entryDate.getMonth()] + " " + entryDate.getDate() + ", " + entryDate.getFullYear(); 
        
        const { classes } = this.props;

        return (
            <Card className={classes.timelineCard}>
                <CardHeader
                    action={
                        <IconButton>
                        <MoreVertIcon />
                        </IconButton>
                    }
                    title= {"Day " + daysAlive + (this.props.title ? " - " + this.props.title : " ")}
                    subheader={readDate}
                />  
                <CardContent>
                    <Typography component="p">
                        {this.props.bodyText}
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
