import React from 'react';
import PropTypes from 'prop-types';
import {Chip, withStyles} from '@material-ui/core';
import TallyMark from '../../objects/tallies/tallyMark';

const styles = theme => ({
    chipWrapper: {
        display: 'inline-block',
    },
    chip: {
        margin: theme.spacing.unit,
    },
});

class TallyMarkChip extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
        };

        this.handleDelete = this.handleDelete.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }

    handleDelete() {
        this.props.deleteTallyMark(this.props.index);
    }
      
    handleClick() {
        alert('You clicked the Chip.'); // eslint-disable-line no-alert
    }

    render() {
        const { classes } = this.props;

        return (
            <div className={classes.chipWrapper}>
                <Chip
                label={this.props.type +" | " + this.props.text}
                onDelete={this.handleDelete}
                className={classes.chip}
                color="primary"
                />
            </div>
        );
    }
}

TallyMarkChip.propTypes = {
    classes: PropTypes.object.isRequired,
  };

export default withStyles(styles)(TallyMarkChip);