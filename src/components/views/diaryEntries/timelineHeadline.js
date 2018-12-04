import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {Card, CardContent, IconButton, Menu, MenuItem, withStyles} from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import DeleteDiaryEntry from './deleteDiaryEntry';

const styles = theme => ({
    timelineCard: {
        minWidth: 275,
        maxWidth: 575,
    },
    headlineText: {
        fontSize: '1.2em',
        display: 'inline-block',
        overflow: 'hidden',
        maxWidth: 450,
        whiteSpace: 'nowrap',
        marginTop: '.2em',
        '@media (max-width: 650px)': { 
            maxWidth: 435,
        },
        '@media (max-width: 550px)': { 
            fontSize: '1em',
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
    headlineVertButton: {
        float: 'right',
        display: 'inline-block',
        marginTop: '-.5em',
    }
});

class TimelineHeadline extends Component {

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
        this.setState({
            anchorEl: null,
        });
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
        const { classes } = this.props;
        const { anchorEl } = this.state;

        return (
            <Card className={classes.timelineCard}>
                <CardContent>
                    <div className={classes.headlineText}>
                        <b>
                            {"Day " + daysAlive + (this.props.title ? " - " + this.props.title : " ")}
                        </b>
                    </div>
                    <div className={classes.headlineVertButton}>
                        <IconButton onClick={this.handleMenuOpen}>
                                <MoreVertIcon/>
                        </IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={this.handleMenuClose}
                                >
                                <DeleteDiaryEntry handleDelete={this.handleDelete} />
                                <MenuItem onClick={this.onViewButtonClick}>View Entry</MenuItem>
                            </Menu>
                    </div>
                </CardContent>
            </Card>
        );
    }
}

TimelineHeadline.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(TimelineHeadline);
