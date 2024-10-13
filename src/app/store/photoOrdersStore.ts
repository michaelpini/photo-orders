import {inject} from "@angular/core";
import {patchState, signalStore, type, withComputed, withHooks, withMethods, withState} from "@ngrx/signals";
import {addEntity, removeEntity, setAllEntities, setEntity, updateEntity, withEntities} from "@ngrx/signals/entities";
import {FirebaseService} from "../persistance/firebase.service";
import {User as AuthUser} from "firebase/auth";
import {User} from "../customers/user.model";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {map, pipe, tap} from "rxjs";

export type State = {
    authUser: AuthUser | null;
    authError: string;
    activeUser: User | null | undefined;
    isBusy: boolean;
    isDirty: boolean;
}

const initialState: State = {
    authUser: null,
    authError: '',
    activeUser:  undefined,
    isBusy: false,
    isDirty: false,
}

export const PhotoOrdersStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),
    withEntities({entity: type<User>(), collection: 'users'}),
    withMethods((store, firebaseService = inject(FirebaseService)) => ({
        setBusy(busy: boolean = false) {
            patchState(store, state => ({...state, isBusy: busy}));
        },
        setDirty(dirty: boolean = false) {
            patchState(store, state => ({...state, isDirty: dirty}));
        },
        async updateActiveUser(authUser: AuthUser | null = null) {
            let activeUser: User | null | undefined;
            if (authUser) activeUser = await firebaseService.getUser(authUser.uid);
            patchState(store, state => ({...state, authUser, activeUser: activeUser || null}));
            console.info('Active user:', activeUser);
        },
        setAuthError(errorMessage: string | undefined = '') {
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
        },
        async loadUsers(user: User | null | undefined): Promise<User[]>{
            let users: User[] = [];
            if (user?.auth === 'user') {users = [user]}
            if (user?.auth === 'admin') {users = await firebaseService.getAllUsers();}
            this.setAllUsers(users);
            return users;
        },
        async getAuth() {
            return new Promise(resolve => {
                rxMethod<User | null | undefined>(pipe(
                    tap(user => {
                        if (user === null) resolve(null)
                        else if (typeof user === 'object') resolve(user.auth)
                    })
                ))(store.activeUser);
            })
        }

    })),
    withComputed((store) => ({

    })),
    withHooks({
        async onInit(store) {
            rxMethod<User | null | undefined>(pipe(
                map(user => store.loadUsers(user))
            ))(store.activeUser);
        }

    }),
)



