import { observable, decorate } from 'mobx';

class DiaryEntryStore {
	entries = [];
}

decorate(DiaryEntryStore, {
	entries: observable,
});

export default new DiaryEntryStore();