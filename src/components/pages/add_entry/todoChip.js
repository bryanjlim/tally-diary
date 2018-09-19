import React from 'react';
import PropTypes from 'prop-types';
import {Chip, withStyles} from '@material-ui/core';
import CheckCircleOutline from '@material-ui/icons/CheckCircleOutline';
import HighlightOff from '@material-ui/icons/HighlightOff'

const styles = theme => ({
    chipWrapper: {
        display: 'inline-block',
    },
    chip: {
        margin: theme.spacing.unit,
    },
});

class TodoChip extends React.Component {

    constructor(props) {
        super(props);
        this.handleDelete = this.handleDelete.bind(this);
    }

    handleDelete() {
        this.props.deleteTodo(this.props.index);
    }

    render() {
        const { classes } = this.props;

        return (
            <div className={classes.chipWrapper}> 
                <Chip
                    icon={this.props.status ? <CheckCircleOutline /> : <HighlightOff/>}
                    label={this.props.text}
                    onDelete={this.handleDelete}
                    className={classes.chip}
                    color="secondary"
                    variant="outlined"
                />  
            </div>
        );
    }
}

TodoChip.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(TodoChip);