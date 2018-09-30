import React, { Component } from 'react';
import TallyMark from '../../objects/tallies/tallyMark';
import DriveHelper from '../../helpers/driveHelper';

export class AddTally extends Component{
    constructor(props) {
        super(props);
        this.state = {
            // New Tally
            newTallyType: '',
            newTallyNum: 0
        };
        this.addNewTallyMark = this.addNewTallyMark.bind(this);
    }

    addNewTallyMark(e) {
        e.preventDefault();
        this.state.tallies.push(new TallyMark(this.state.tallyMarkType, 0));
        this.setState({
            newTallyType: '',
            newTallyNum: 0
        });
    }

    render() {
        return (
            <div>
                <h1>New Tally</h1>
                <form onSubmit={this.addNewTallyMark} className="add-tally-mark-form">
                    <select name="newTallyMarkType" value={this.state.selectedTallyMarkType} onChange={this.handleInputChange}>
                        <option value={TallyMark.tallyTypeEnum.FOOD}>Food</option>
                        <option value={TallyMark.tallyTypeEnum.ACTIVITY}>Activity</option>
                        <option value={TallyMark.tallyTypeEnum.LANDMARK}>Landmark</option>
                        <option value={TallyMark.tallyTypeEnum.PERSON}>Person</option>
                        <option value={TallyMark.tallyTypeEnum.OTHER}>Other</option>
                    </select>
                    <input id="newTallyMarkText"
                        name="newTallyMarkText"
                        type="text"
                        required
                        value={this.state.newTallyMarkText}
                        onChange={this.handleInputChange} />
                    <button>Add Tally Mark</button>
                </form>
            </div>
        );
    }
}

export default AddTally;
