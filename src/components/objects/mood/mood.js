export default class Mood {
    static moodEnum = {
        MEH: 0,
        SAD: 1,
        HAPPY: 2
    }

    constructor(mood) {
        this.mood = mood; 
    }
}