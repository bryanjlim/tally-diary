import { observable, decorate } from 'mobx';

class UserPreferenceStore {
	preferences = {};
}

decorate(UserPreferenceStore, {
	preferences: observable,
});

export default new UserPreferenceStore();