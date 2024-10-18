import {computed, inject} from "@angular/core";
import {patchState, signalStore, type, withComputed, withHooks, withMethods, withState} from "@ngrx/signals";
import {removeEntity, setAllEntities, setEntity, withEntities} from "@ngrx/signals/entities";
import {FirebaseService} from "../persistance/firebase.service";
import {User as AuthUser} from "firebase/auth";
import {User} from "../customers/user.model";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {map, pipe, tap} from "rxjs";
import {setBusy, setError, setIdle, withLoadingState} from "./withLoadingState";

export type State = {
    authUser: AuthUser | null;
    activeUser: User | null | undefined;
    isDirty: boolean;
}

const initialState: State = {
    authUser: null,
    activeUser:  undefined,
    isDirty: false,
}

export const PhotoOrdersStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),
    withLoadingState(),
    withEntities({entity: type<User>(), collection: 'users'}),
    withMethods((store, firebaseService = inject(FirebaseService)) => ({
        setBusy(busy: boolean = false) {
            patchState(store, busy ? setBusy() : setIdle());
        },
        setIdle() {
            patchState(store, setIdle())
        },
        setError(error: string) {
           patchState(store, setError(error));
        },
        setDirty(dirty: boolean = false) {
            patchState(store, state => ({...state, isDirty: dirty}));
        },
        async updateActiveUser(authUser: AuthUser | null = null) {
            patchState(store, setBusy());
            let activeUser: User | null | undefined;
            if (authUser) activeUser = await firebaseService.getUser(authUser.uid);
            patchState(store, state => ({...state, authUser, activeUser: activeUser || null}), setIdle());
        },
        // Users
        getUser(id: string = '') {
            const userMap = store.usersEntityMap();
            return userMap[id] || null;
        },
        setUser(user: User) {
            // Firebase
            patchState(store, setEntity(user, {collection: 'users'}));
        },
        removeUser(id: string = '') {
            // Firebase
            patchState(store, removeEntity(id, {collection: 'users'}));
        },
        setAllUsers(users: User[]) {
            patchState(store, setAllEntities(users, {collection: 'users'}), setIdle());
        },
        async loadUsers(user: User | null | undefined): Promise<User[]>{
            patchState(store, setBusy());
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
        isAdmin: computed(() => store.activeUser()?.auth === 'admin'),
    })),
    withHooks({
        async onInit(store) {
            rxMethod<User | null | undefined>(pipe(
                map(user => store.loadUsers(user))
            ))(store.activeUser);
        }

    }),
)



