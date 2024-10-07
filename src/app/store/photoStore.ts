import {AuthUser} from "../auth/user.model";
import {patchState, signalState, signalStore, type, withHooks, withMethods, withState} from "@ngrx/signals";
import {setAllEntities, withEntities} from "@ngrx/signals/entities";
import {state} from "@angular/animations";

export type State = {
    authUser: AuthUser | null;
    authError: string;
    isBusy: boolean;
}
export type Auth = 'admin' | 'customer';
export type User = {
    id: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    phone: string;
    type?: 'private' | 'business' | 'friend',
    auth?: Auth,
    amount?: number
}

const initialState: State = {
    authUser: null,
    authError: '',
    isBusy: false,
}
const initialUsersState: User[] = [
    {id: '1', firstName: 'Michi', lastName: 'Pini', phone: '078 7732560', auth: 'admin'},
    {id: '2', firstName: 'The', lastName: 'Pini-On', phone: '076 2200283', auth: 'customer', amount: 23556},
    {id: '3', firstName: 'Kevin', lastName: 'Pini', phone: '076 1234567', auth: 'admin', amount: 904.45},
    {id: '4', firstName: 'Markus', lastName: 'Kurz', phone: '', auth: 'customer', amount: 34322.60},
]



export const PhotoStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),
    withEntities({ entity: type<User>(), collection: 'users' }),
    withHooks({
        onInit(store) {
            patchState(store, setAllEntities(initialUsersState, {collection: 'users' }));
        }
    }),
    withMethods(store => ({
        setBusy(busy: boolean = false) {
            patchState(store, state => ({...state, isBusy: busy}));
        },
        updateAuthUser(user: AuthUser | null = null) {
            patchState(store, state => ({...state, authUser: user}));
        },
        setAuthError(errorMessage: string = '') {
            patchState(store, state => ({...state, authError: errorMessage}));
        }
    }))
)


