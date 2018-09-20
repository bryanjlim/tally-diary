import React, { Component } from 'react';
import {Card, CircularProgress, withStyles} from '@material-ui/core';
import InsightsItem from '../../views/insights/insightsItem';
import DriveHelper from '../../helpers/driveHelper';
import PropTypes from 'prop-types';

const styles = theme => ({
    insightCard: {
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingTop: 50, 
        paddingBottom: 50,
        minWidth: 275,
        maxWidth: 575,
    },
    insightsItemText: {
        textAlign: 'center',
        marginTop: 'auto',
        marginBottom: 'auto',
    },
    circularProgress: {
        textAlign: 'center',
    }
});

class Insights extends Component {

    constructor(props) {
        super(props); 
        this.state = { fileCount: 0 }
    }

    componentDidMount() {
        DriveHelper.getFileCount().then((count) => {
            this.setState({fileCount: count}); 
        })
    }

    render() { 
        const { classes } = this.props;

        return (
            <div>

            { this.state.fileCount == 0 ? 
                <CircularProgress className={classes.circularProgress}/> : 
                <Card className={classes.insightCard}><InsightsItem entryCount={this.state.fileCount - 1}/></Card> 
                
            }
            
            </div>
        );
    }
}

Insights.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Insights);
