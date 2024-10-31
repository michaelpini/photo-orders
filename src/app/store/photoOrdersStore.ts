import {computed, inject} from "@angular/core";
import {patchState, signalStore, type, withComputed, withHooks, withMethods, withState} from "@ngrx/signals";
import {removeEntity, setAllEntities, setEntity, withEntities} from "@ngrx/signals/entities";
import {FirebaseService} from "../persistance/firebase.service";
import {User} from "../customers/user.model";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {map, pipe, tap} from "rxjs";
import {setBusy, setError, setIdle, withLoadingState} from "./withLoadingState";
import {ToastService} from "../shared/toasts/toast.service";
import {AuthType, AuthUser} from "../auth/authUser.model";

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
            if (store.isDirty() === dirty) return;
            patchState(store, state => ({...state, isDirty: dirty}));
        },

        // AuthUser
        async getAuth(): Promise<AuthType | null> {
            return new Promise(resolve => {
                const rx = rxMethod<AuthUser | null | undefined>(pipe(
                    tap(authUser => {
                        if (authUser === undefined) return;
                        resolve(authUser?.authType || null);
                        rx.unsubscribe();
                    })
                ))(store.authUser);
            })
        },
        async setAuthUserAndActiveUser(uid?: string): Promise<void> {
            try {
                patchState(store, setBusy());
                let authUser = await firebaseService.getAuthUser(uid);
                let activeUser = await firebaseService.getUser(authUser?.userId);
                patchState(store, state => ({...state, authUser, activeUser}), setIdle());
            } catch (error) {
                this.setError((error as Error).message);
                throw error;
            }
        },

        // ActiveUser
        setActiveUser(activeUser: User | null) {
            patchState(store, state => ({...state, activeUser}));
        },

        // Users
        getUser(id = ''): User | null {
            const userMap = store.usersEntityMap();
            return userMap[id] || null;
        },
        getAllUsers(): User[] {
            return store.usersEntities();
        },
        async loadUsers(authUser: AuthUser | null | undefined): Promise<User[]>{
            patchState(store, setBusy());
            let users: User[] = [];
            try {
                if (authUser?.authType === 'admin') {
                    users = await firebaseService.getAllUsers();
                } else if (store.activeUser()) {
                    users =  [store.activeUser() as User];
                }
                patchState(store, setAllEntities(users, {collection: 'users'}), setIdle());
                return users;
            } catch (error) {
                this.setError((error as Error).message);
                throw error;
            }
        },
        async setUser(user: User): Promise<void> {
            try {
                await firebaseService.setUser(user);
                patchState(store, setEntity(user, {collection: 'users'}));
                toastService.showSuccess('User wurde gespeichert');
            } catch (error) {
                this.setError((error as Error).message);
            }
        },
        async updateUser(user: User): Promise<User> {
            try {
                patchState(store, setBusy());
                const updatedUser = await firebaseService.updateUser(user);
                patchState(store, state => ({...state, activeUser: updatedUser}), setIdle());
                toastService.showSuccess('User wurde gespeichert');
                return updatedUser;
            } catch (error) {
                this.setError((error as Error).message);
                throw error;
            }
        },
        async removeUser(id: string = ''): Promise<void> {
            try {
                await firebaseService.removeUser(id);
                patchState(store, removeEntity(id, {collection: 'users'}));
                toastService.showSuccess('User wurde gelöscht. (Auth separat löschen)');
            } catch (error) {
                this.setError((error as Error).message);
                throw error;
            }
        },


    })),

    withComputed((store) => ({
        isAdmin: computed(() => store.authUser()?.authType === 'admin'),
    })),

    withHooks({
        async onInit(store) {
            rxMethod<AuthUser | null | undefined>(pipe(
                map(authUser => store.loadUsers(authUser))
            ))(store.authUser);
        }

    }),
)



