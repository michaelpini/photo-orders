import {computed, inject} from "@angular/core";
import {patchState, signalStore, type, withComputed, withHooks, withMethods, withState} from "@ngrx/signals";
import {removeEntity, setAllEntities, setEntity, withEntities} from "@ngrx/signals/entities";
import {FirebaseService} from "../persistance/firebase.service";
import {User as AuthUser} from "firebase/auth";
import {Auth, User} from "../customers/user.model";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {map, pipe, tap} from "rxjs";
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
        setActiveUser(activeUser: User | null) {
            patchState(store, state => ({...state, activeUser}));
        },
        async setActiveUserFromAuthUser(authUser: AuthUser | null = null): Promise<void> {
            try {
                patchState(store, setBusy());
                let activeUser: User | null | undefined;
                if (authUser) activeUser = await firebaseService.getUserByUid(authUser.uid);
                patchState(store, state => ({...state, authUser, activeUser: activeUser || null}), setIdle());
            } catch (error) {
                this.setError((error as Error).message);
                throw error;
            }
        },
        // Users
        getUser(id = ''): User | null {
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
        async getAuth(): Promise<Auth | null> {
            return new Promise(resolve => {
                const rx = rxMethod<User | null | undefined>(pipe(
                    tap(user => {
                        if (user === undefined) return
                        if (user === null) resolve(null)
                        else if (typeof user === 'object') resolve(user.auth || null)
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



