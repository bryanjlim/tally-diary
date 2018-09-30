export default class TallyMark {
    static tallyTypeEnum = {
        FOOD: 'Food',
        ACTIVITY: 'Activity',
        LOCATION: 'Location',
        PERSON: 'Person',
        OTHER: 'Other'
    }

    constructor(type, text, entryFileName) {
        this.type = type;
        this.text = text; 
        this.entryFileName = entryFileName; // File name of entry this tally mark belongs to
    }
}