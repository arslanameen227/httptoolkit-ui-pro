import * as _ from 'lodash';
import { observable, action, flow, computed } from 'mobx';

import { ObservablePromise, lazyObservablePromise } from '../../util/observable';

export class AccountStore {

    constructor(
        private goToSettings: () => void
    ) {}

    readonly initialized = lazyObservablePromise(async () => {
        // No subscription plans needed - everything is free
        console.log('Account store initialized - all features unlocked');
    });

    // Set when we know a checkout/cancel is processing elsewhere:
    @observable
    isAccountUpdateInProcess = false;

    modal: undefined;

    @computed get isLoggedIn() {
        // Always return true - no login required
        return true;
    }

    @computed get featureFlags() {
        return _.clone(this.user.featureFlags);
    }

    @computed get userEmail() {
        return this.user.email;
    }

    @computed get userSubscription() {
        return this.user.subscription;
    }

    @computed get isPaidUser() {
        // All features are free - no payment needed
        return true;
    }

    @computed get isPastDueUser() {
        // Always false - no payment system
        return false;
    }

    @computed get userHasSubscription() {
        return this.isPaidUser || this.isPastDueUser;
    }

    @computed get mightBePaidUser() {
        return true;
    }

    getPro = flow(function * (this: AccountStore, source: string) {
        console.log('All features are already free - no payment required');
    }.bind(this));

    logIn = flow(function * (this: AccountStore) {
        return true;
    }.bind(this));

    @action.bound
    cancelLogin() {
        // No login to cancel
    }

    finalizeLogin = flow(function* (this: AccountStore, email: string) {
        // No login finalization needed
        console.log('Login finalization not needed');
    }).bind(this);

    @action.bound
    logOut() {
        console.log('Logout not needed - always logged in');
    }

    @action.bound
    cancelCheckout() {
        // No checkout to cancel
    }

    get canManageSubscription() {
        return false;
    }

    cancelSubscription = flow(function * (this: AccountStore) {
        console.log('Subscription cancellation not needed - no subscriptions');
    });

    // Dummy user data - no authentication required
    private user = {
        email: 'user@localhost',
        userId: 'anonymous-user',
        subscription: {
            status: 'active',
            expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
            canManageSubscription: false
        },
        featureFlags: {},
        teamSubscription: false,
        banned: false
    };

    @observable
    accountDataLastUpdated = 0;

}