import React, { Component } from 'react';
import {withStyles} from '@material-ui/core';
import Entry from '../../pages/entry/entry';
import PropTypes from 'prop-types';
import {Redirect} from 'react-router-dom';

class EntryViewer extends Component {

    constructor(props) {
        super(props); 

        this.viewTimeline = this.viewTimeline.bind(this);
        this.navigateBack = this.navigateBack.bind(this);
        this.navigateForward = this.navigateForward.bind(this);
        this.handleIndexRedirect = this.handleIndexRedirect.bind(this);
        const entryIndex = this.props.entryIndex;

        if(entryIndex >= 0 && entryIndex < this.props.diaryEntryStore.entries.length) {
            this.state = {
                redirectToIndex: false,
                redirectIndex: entryIndex,
                redirectToTimeline: false,
                singleEntryFileName: this.props.diaryEntryStore.entries[entryIndex].fileName,
                singleEntryIndex: entryIndex,
                singleEntryTitle: this.props.diaryEntryStore.entries[entryIndex].title,
                singleEntryDate: this.props.diaryEntryStore.entries[entryIndex].date,
                singleEntryIsThumbUp: this.props.diaryEntryStore.entries[entryIndex].isThumbUp,
                singleEntryIsThumbDown: this.props.diaryEntryStore.entries[entryIndex].isThumbDown,
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
            redirectToTimeline: true,
        })
    }

    navigateForward() {
        this.setState({
            redirectToIndex: true,
            redirectIndex: Number(this.props.entryIndex) + 1,
        })
    }

    navigateBack() {
        this.setState({
            redirectToIndex: true,
            redirectIndex: Number(this.props.entryIndex) - 1,
        })
    }

    handleIndexRedirect() {
        this.setState({
            redirectToIndex: false,
            redirectIndex: this.props.entryIndex,
            redirectToTimeline: false,
            singleEntryFileName: this.props.diaryEntryStore.entries[this.props.entryIndex].fileName,
            singleEntryIndex: this.props.entryIndex,
            singleEntryTitle: this.props.diaryEntryStore.entries[this.props.entryIndex].title,
            singleEntryDate: this.props.diaryEntryStore.entries[this.props.entryIndex].date,
            singleEntryIsThumbUp: this.props.diaryEntryStore.entries[this.props.entryIndex].isThumbUp,
            singleEntryIsThumbDown: this.props.diaryEntryStore.entries[this.props.entryIndex].isThumbDown,
            singleEntryBodyText: this.props.diaryEntryStore.entries[this.props.entryIndex].bodyText,
            singleEntryTodos: this.props.diaryEntryStore.entries[this.props.entryIndex].todos,
            singleEntryTallies: this.props.diaryEntryStore.entries[this.props.entryIndex].tallies,
        });
    }

    render() {
        if(this.state.redirectIndex != this.props.entryIndex) {
            this.handleIndexRedirect();
        }

        if(this.state.redirectToTimeline) {
            return (
                <Redirect to="/timeline" push />
            );
        } else if(this.state.redirectToIndex) {
            const goHere = this.state.redirectIndex;

            const location = "/timeline/" + goHere;
            return (
                <Redirect to={location} push />
            );
        } else{
            return (
                <Entry 
                    adding={false}
                    fileName={this.state.singleEntryFileName}
                    index={this.state.singleEntryIndex}
                    title={this.state.singleEntryTitle}
                    date={this.state.singleEntryDate}
                    isThumbUp={this.state.singleEntryIsThumbUp}
                    isThumbDown={this.state.singleEntryIsThumbDown}
                    bodyText={this.state.singleEntryBodyText}
                    todos={this.state.singleEntryTodos}
                    tallies={this.state.singleEntryTallies}
                    userStore={this.props.userStore}
                    diaryEntryStore={this.props.diaryEntryStore}
                    back={this.viewTimeline}
                    navigateBack = {this.navigateBack}
                    navigateForward = {this.navigateForward}
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
