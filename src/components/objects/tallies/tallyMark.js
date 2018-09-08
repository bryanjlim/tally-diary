export default class TallyMark {
    static tallyTypeEnum = {
        FOOD: 0,
        ACTIVITY: 1,
        LOCATION: 2,
        PERSON: 3,
        OTHER: 4
    }

    constructor(type, text) {
        this.type = type;
        this.text = text; 
    }
}