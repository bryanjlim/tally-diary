export default class TallyMark {
    static tallyTypeEnum = {
        FOOD: 'Food',
        ACTIVITY: 'Activity',
        LOCATION: 'Location',
        PERSON: 'Person',
        OTHER: 'Other'
    }

    constructor(type, text, num) {
        this.type = type;
        this.text = text; 
        this.num = num;
    }
}