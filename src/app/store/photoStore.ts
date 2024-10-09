import {computed, inject} from "@angular/core";
import {AuthUser} from "../auth/authUser.model";
import {patchState, signalStore, type, withComputed, withHooks, withMethods, withState} from "@ngrx/signals";
import {addEntity, removeEntity, setAllEntities, setEntity, updateEntity, withEntities} from "@ngrx/signals/entities";
import {FirebaseService} from "../persistance/firebase.service";
import {User} from "../customers/customer.model";

export type State = {
    authUser: AuthUser | null;
    authError: string;
    activeUser: User | null;
    isBusy: boolean;
    isDirty: boolean;
}

const initialState: State = {
    authUser: null,
    authError: '',
    activeUser: null,
    isBusy: false,
    isDirty: false,
}

export const PhotoStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),
    withEntities({entity: type<User>(), collection: 'users'}),
    withMethods(store => ({
        setBusy(busy: boolean = false) {
            patchState(store, state => ({...state, isBusy: busy}));
        },
        updateAuthUser(authUser: AuthUser | null = null) {
            patchState(store, state => ({...state, authUser: authUser}));
        },
        setAuthError(errorMessage: string = '') {
            patchState(store, state => ({...state, authError: errorMessage}));
        },
        // Users
        addUser(user: User) {
            patchState(store, addEntity(user, {collection: 'users'}));
        },
        removeUser(user: User) {
            patchState(store, removeEntity(user.id, {collection: 'users'}));
        },
        setUser(user: User) {
            patchState(store, setEntity(user, {collection: 'users'}));
        },
        updateUser(user: User) {
            const {id, ...changes} = user;
            patchState(store, updateEntity({id, changes}, {collection: 'users'}));
        },
        setAllUsers(users: User[]) {
            patchState(store, setAllEntities(users, {collection: 'users'}));
        }
    })),
    withComputed(({authUser, usersEntityMap}) => ({
        activeUser: computed((): any => {
            const id: string = authUser()?.id || '';
            const user = usersEntityMap()[id];
            console.log('active user:', user)
            return user;
        }),
    })),
    withHooks({
        async onInit(store) {
            const allUsers: User[] = await inject(FirebaseService).getAllUsers()
            store.setAllUsers(allUsers);
        }
    }),
)



