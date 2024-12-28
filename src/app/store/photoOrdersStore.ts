import {computed, inject} from "@angular/core";
import {patchState, signalStore, type, withComputed, withHooks, withMethods, withState} from "@ngrx/signals";
import {removeEntity, setAllEntities, setEntity, updateEntity, withEntities} from "@ngrx/signals/entities";
import {FirebaseService} from "../persistance/firebase.service";
import {User} from "../components/customers/user.model";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {pipe, tap} from "rxjs";
import {setBusy, setError, setIdle, withLoadingState} from "./withLoadingState";
import {ToastService} from "../shared/toasts/toast.service";
import {AuthType, AuthUser} from "../auth/authUser.model";
import {Project} from "../components/projects/project.model";
import {Photo} from "../modals/modal.service";
import {delay} from "../shared/util";

export type State = {
    authInitializingNewUser: boolean;
    authUser: AuthUser | null | undefined;
    activeUser: User | null | undefined;
    isDirty: boolean;
    isInitialized: boolean;
}

export interface PhotoExtended extends Photo {
    urlMedium?: string;
    urlLarge?: string;
    urlFull?: string;
    selected?: boolean;
}

const initialState: State = {
    authInitializingNewUser: false,
    authUser: undefined,
    activeUser:  undefined,
    isDirty: false,
    isInitialized: false,
}

function addThumbnails(photos: Photo[], projectId: string): PhotoExtended[] {
    if (photos.length > 0) {
        const image1Link = photos[0].downloadUrl;
        const base = image1Link.split('/images')[0] + '/';
        const result: PhotoExtended[] = photos.map((photo) => {
            const filename = photo.fileName;
            const extension = photo.fileExtension;
            const urlBase = `images/projects/${projectId}`;
            const urlThumbBase = `${urlBase}/thumbnails/${filename}`;
            const urlMedium = base + encodeURIComponent(`${urlThumbBase}_600x600.${extension}`) + '?alt=media';
            const urlLarge = base + encodeURIComponent(`${urlThumbBase}_2000x2000.${extension}`) + '?alt=media';
            const urlFull = base + encodeURIComponent(`${urlBase}/${photo.fullName}`) + '?alt=media';
            return {...photo, urlMedium, urlLarge, urlFull}
        });
        console.log(result);
        return result;
    }
    return [];
}

export const PhotoOrdersStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),

    withLoadingState(),

    withEntities({entity: type<User>(), collection: 'users'}),
    withEntities({entity: type<Project>(), collection: 'projects'}),
    withEntities({entity: type<PhotoExtended>(), collection: 'photos'}),

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
            patchState(store, {isDirty: dirty});
        },

        // AuthUser
        setAuthInitializingNewUser(initializing: boolean) {
           patchState(store, {authInitializingNewUser: initializing});
        },

        setAuthUser(authUser: AuthUser) {
            patchState(store, {authUser: authUser})
        },

        async getAuth(): Promise<AuthType | null> {
            return new Promise(resolve => {
                const rx = rxMethod<AuthUser | null | undefined>(pipe(
                    tap(authUser => {
                        if (authUser === undefined) return;
                        resolve(authUser ? authUser?.authType || 'user' : null);
                        rx.destroy();
                    })
                ))(store.authUser);
            })
        },

        async setAuthUserAndActiveUser(uid: string | undefined): Promise<void> {
            try {
                patchState(store, setBusy());
                let authUser = uid ? await firebaseService.getAuthUser(uid) : null;
                let activeUser = authUser ? await firebaseService.getUser(authUser.userId) : null;
                patchState(store, {authUser, activeUser}, setIdle());
            } catch (error) {
                this.setError((error as Error).message);
                throw error;
            }
        },


        // ActiveUser
        setActiveUser(activeUser: User | null) {
            patchState(store, {activeUser});
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
                patchState(store,
                    updateEntity({id: updatedUser.id, changes: updatedUser}, {collection: 'users'}),
                    setIdle()
                );
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

        // Projects
        getProject(id = ''): Project | null {
            const projectMap = store.projectsEntityMap();
            return projectMap[id] || null;
        },

        getAllProjects(): Project[] {
            return store.projectsEntities();
        },

        async loadProjects(authUser: AuthUser | null | undefined): Promise<Project[]>{
            patchState(store, setBusy());
            let projects: Project[] = [];
            try {
                if (authUser?.authType === 'admin') {
                    projects = await firebaseService.getAllProjects();
                } else if (authUser?.userId) {
                    projects = await firebaseService.queryProjectsByUserId(authUser.userId) || [];
                }
                patchState(store, setAllEntities(projects, {collection: 'projects'}), setIdle());
                return projects;
            } catch (error) {
                this.setError((error as Error).message);
                throw error;
            }
        },

        async setProject(project: Project): Promise<void> {
            try {
                await firebaseService.setProject(project);
                patchState(store, setEntity(project, {collection: 'projects'}));
                toastService.showSuccess('Projekt wurde gespeichert');
            } catch (error) {
                this.setError((error as Error).message);
            }
        },

        async updateProject(project: Project): Promise<Project> {
            try {
                patchState(store, setBusy());
                const updatedProject = await firebaseService.updateProject(project);
                patchState(store,
                    updateEntity({id: updatedProject.id, changes: updatedProject}, {collection: 'projects'}),
                    setIdle()
                );
                toastService.showSuccess('Projekt wurde gespeichert');
                return updatedProject;
            } catch (error) {
                this.setError((error as Error).message);
                throw error;
            }
        },

        async removeProject(id: string = ''): Promise<void> {
            try {
                await firebaseService.removeProject(id);
                patchState(store, removeEntity(id, {collection: 'projects'}));
                toastService.showSuccess('Projekt wurde gelöscht.');
            } catch (error) {
                this.setError((error as Error).message);
                throw error;
            }
        },

        // Photos
        async loadPhotos(projectId: string): Promise<PhotoExtended[]>{
            let photos: Photo[] = [];
            try {
                photos = await firebaseService.getAllProjectPhotos(projectId);
                const photosExtended = addThumbnails(photos, projectId);
                patchState(store, setAllEntities(photosExtended, {collection: 'photos'}));
                return photosExtended;
            } catch (error) {
                this.setError((error as Error).message);
                throw error;
            }
        },

        setAllPhotos(photos: PhotoExtended[]): void {
            patchState(store, setAllEntities(photos, {collection: `photos`}));
        },

        async addPhoto(projectId: string, photo: Photo): Promise<void> {
            try {
                await firebaseService.addProjectPhoto(projectId, photo);
                const photoExtended = addThumbnails([photo], projectId)[0];
                await delay(5000);  // Allow some time for the firestore extension to create thumbnails
                patchState(store, setEntity(photoExtended, {collection: `photos`}));
            } catch (error) {
                this.setError((error as Error).message);
            }
        },

        async updatePhoto(projectId: string | null, photo: PhotoExtended): Promise<void> {
            try {
                if (projectId) await firebaseService.updateProjectPhoto(projectId, photo);
                patchState(store, setEntity(photo, {collection: `photos`}));
            } catch (error) {
                this.setError((error as Error).message);
            }

        },

        async removePhotos(projectId: string, photos: PhotoExtended[]): Promise<void> {
            try {
                await Promise.all([
                    photos.map(async photo => {
                        await firebaseService.deletePhoto(projectId, photo);
                        await firebaseService.removeProjectPhoto(projectId, photo);
                        patchState(store, removeEntity(photo.id, {collection: 'photos'}));
                    })
                ])
                toastService.showSuccess('Photo(s) wurden gelöscht.');
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
            const subscription = rxMethod<AuthUser | null | undefined>(pipe(
                tap(async authUser =>  {
                    setBusy();
                    await Promise.all([
                        store.loadUsers(authUser),
                        store.loadProjects(authUser)
                        ])
                    setIdle();
                    if (authUser) {
                        patchState(store, {isInitialized: true});
                        subscription.destroy();
                    }
                })
            ))(store.authUser);
        }
    }),
)



