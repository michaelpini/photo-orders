import {User} from "../auth/user.model";
import {patchState, signalStore, withMethods, withState} from "@ngrx/signals";
import {withEntities} from "@ngrx/signals/entities";

export type State = {
    authUser: User | null;
    isLoading: boolean;
}

export type Customer = {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    type: 'private' | 'business' | 'friend'
}

const initialState: State = {
    authUser: null,
    isLoading: false
}

export const PhotoStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),
    withEntities<Customer>(),
    withMethods(store => ({
        updateAuthUser(user: User | null) {
            patchState(store, state => {
                return {...state, authUser: user};
            })
        },
    }))
)

