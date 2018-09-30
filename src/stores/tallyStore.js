import { observable, decorate } from 'mobx';

// Stores all tally marks
class TallyStore {
	tallyMarks = []; // Array of tally marks
}

decorate(TallyStore, {
	tallyMarks: observable,
});

export default new TallyStore();