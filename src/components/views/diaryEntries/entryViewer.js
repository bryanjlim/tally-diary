import React, { Component } from 'react';
import {withStyles} from '@material-ui/core';
import Entry from '../../pages/entry/entry';
import PropTypes from 'prop-types';
import {Redirect} from 'react-router-dom';

class EntryViewer extends Component {

    constructor(props) {
        super(props); 
        this.viewTimeline = this.viewTimeline.bind(this);
        const entryIndex = this.props.entryIndex;

        if(entryIndex >= 0 && entryIndex < this.props.diaryEntryStore.entries.length) {
            this.state = {
                redirect: false,
                singleEntryFileName: this.props.diaryEntryStore.entries[entryIndex].fileName,
                singleEntryIndex: entryIndex,
                singleEntryTitle: this.props.diaryEntryStore.entries[entryIndex].title,
                singleEntryDate: this.props.diaryEntryStore.entries[entryIndex].date,
                singleEntryMood: this.props.diaryEntryStore.entries[entryIndex].mood,
                singleEntryWeather: this.props.diaryEntryStore.entries[entryIndex].weather,
                singleEntryBodyText: this.props.diaryEntryStore.entries[entryIndex].bodyText,
                singleEntryTodos: this.props.diaryEntryStore.entries[entryIndex].todos,
                singleEntryTallies: this.props.diaryEntryStore.entries[entryIndex].tallies,
            }
        } else {
            this.viewTimeline();
        }
    }

    viewTimeline() {
        this.setState({
            redirect: true,
        })
    }

    render() {
        const { classes } = this.props;

        if(this.state.redirect) {
            return (
                <Redirect to="/timeline" push />
            );
        } else {
            return (
                <Entry 
                    adding={false}
                    fileName={this.state.singleEntryFileName}
                    index={this.state.singleEntryIndex}
                    title={this.state.singleEntryTitle}
                    date={this.state.singleEntryDate}
                    mood={this.state.singleEntryMood}
                    weather={this.state.singleEntryWeather}
                    bodyText={this.state.singleEntryBodyText}
                    todos={this.state.singleEntryTodos}
                    tallies={this.state.singleEntryTallies}
                    userStore={this.props.userStore}
                    diaryEntryStore={this.props.diaryEntryStore}
                    back={this.viewTimeline}
                /> 
            );
        }
        
    }
}

const styles = theme => ({
    centerText: {
        marginLeft: 'auto',
        marginRight: 'auto',
        textAlign: 'center',
    }, 
});

EntryViewer.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(EntryViewer);
