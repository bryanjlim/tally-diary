import React, { Component } from 'react';
import {Card, withStyles} from '@material-ui/core';
import InsightsItem from '../../views/insights/insightsItem';
import PropTypes from 'prop-types';

class Insights extends Component {

    constructor(props) {
        super(props); 
        this.state = { fileCount: 0 }
    }

    render() { 
        const { classes } = this.props;

        return (
            <div>
                <Card className={classes.insightCard}><InsightsItem entryCount={this.props.diaryEntryStore.entries.length}/></Card>   
            </div>
        );
    }
}

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
    }
});

Insights.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Insights);
