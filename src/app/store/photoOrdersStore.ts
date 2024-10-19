import {computed, inject} from "@angular/core";
import {patchState, signalStore, type, withComputed, withHooks, withMethods, withState} from "@ngrx/signals";
import {removeEntity, setAllEntities, setEntity, withEntities} from "@ngrx/signals/entities";
import {FirebaseService} from "../persistance/firebase.service";
import {User as AuthUser} from "firebase/auth";
import {User} from "../customers/user.model";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {first, map, pipe, tap} from "rxjs";
import {setBusy, setError, setIdle, withLoadingState} from "./withLoadingState";
import {ToastService} from "../shared/toasts/toast.service";

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
    withMethods((store, firebaseService = inject(FirebaseService), toastService = inject(ToastService)) => ({
        setBusy() {
            patchState(store, setBusy());
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
        async loadUsers(user: User | null | undefined): Promise<User[]>{
            patchState(store, setBusy());
            let users: User[] = [];
            if (user?.auth === 'user') users = [user];
            try {
                if (user?.auth === 'admin') {users = await firebaseService.getAllUsers();}
                patchState(store, setAllEntities(users, {collection: 'users'}), setIdle());
                return users;
            } catch (error) {
                this.setError((error as Error).message);
                throw error;
            }
        },
        async setUser(user: User) {
            try {
                await firebaseService.setUser(user);
                patchState(store, setEntity(user, {collection: 'users'}));
                toastService.showSuccess('User wurde gespeichert');
            } catch (error) {
                this.setError((error as Error).message);
            }
        },
        async removeUser(id: string = '') {
            try {
                await firebaseService.removeUser(id);
                patchState(store, removeEntity(id, {collection: 'users'}));
                toastService.showSuccess('User wurde gelöscht. (Auth separat löschen)');
            } catch (error) {
                this.setError((error as Error).message);
                throw error;
            }
        },
        async getAuth() {
            return new Promise(resolve => {
                const rx = rxMethod<User | null | undefined>(pipe(
                    tap(user => {
                        if (user === undefined) return
                        if (user === null) resolve(null)
                        else if (typeof user === 'object') resolve(user.auth)
                        rx.unsubscribe();
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



