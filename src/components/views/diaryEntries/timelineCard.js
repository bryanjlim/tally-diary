import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {Card, CardActions, CardContent, CardHeader, IconButton, Button, Typography, Menu, MenuItem, withStyles} from '@material-ui/core';
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
        this.state = {
            anchorEl: null,
        }
        this.onViewButtonClick = this.onViewButtonClick.bind(this);
        this.handleMenuOpen = this.handleMenuOpen.bind(this);
        this.handleMenuClose = this.handleMenuClose.bind(this);
    }


    onViewButtonClick() {
        this.props.viewSingleEntry(this.props.fileName, this.props.index, this.props.title, this.props.date, 
                                   this.props.mood, this.props.weather, this.props.bodyText, this.props.todos, 
                                   this.props.tallies);
    } 

    handleMenuOpen = event => {
        this.setState({ anchorEl: event.currentTarget });
    };
    
    handleMenuClose = () => {
        this.setState({ anchorEl: null });
    };

    handleDelete = () => {
        this.props.deleteEntry(this.props.fileName, this.props.index);
    }

    render() {
        const entryDate = new Date(this.props.date);
        const daysAlive = Math.round((entryDate - new Date(this.props.birthDate)) / (1000 * 60 * 60 * 24));
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const readDate = months[entryDate.getMonth()] + " " + entryDate.getDate() + ", " + entryDate.getFullYear(); 
        const { classes } = this.props;
        const { anchorEl } = this.state;

        return (
            <Card className={classes.timelineCard}>
                <CardHeader
                    action={
                        <div>
                        <IconButton onClick={this.handleMenuOpen}>
                            <MoreVertIcon/>
                        </IconButton>
                            <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={this.handleMenuClose}
                            >
                            <MenuItem onClick={this.handleDelete}>Delete</MenuItem>
                        </Menu>
                        </div>
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
