import {Injectable} from "@angular/core";
import {firebaseStore as db} from "../../main";
import {collection, doc, getDocs, getDoc, setDoc, QuerySnapshot, DocumentData, deleteDoc, updateDoc, DocumentReference, query, where, WhereFilterOp} from "firebase/firestore";
import {User} from "../components/customers/user.model";
import {AuthUser} from "../auth/authUser.model";
import {Project} from "../components/projects/project.model";

@Injectable({
    providedIn: 'root',
})
export class FirebaseService {

    private toArray(querySnapshot: QuerySnapshot) {
        const data: DocumentData[] = []
        querySnapshot.forEach((doc) => {
            data.push(doc.data());
        });
        return data;
    }

    /**
     * AuthUsers
     * */
    getAuthUser(id?: string) {
        return this.get<AuthUser>('authUsers', id, 'AuthUser');
    }

    queryAuthUserByUserId(userId: string = '') {
        return this.query<AuthUser>('authUsers', 'userId', "==", userId);
    }

    setAuthUser(authUser: AuthUser) {
        return this.set<AuthUser>('authUsers', authUser, 'AuthUser');
    }

    updateAuthUser(authUser: Partial<AuthUser>) {
        return this.update<AuthUser>('authUsers', authUser, 'AuthUser');
    }


    /**
     * Users
     */
    getUser(id?: string) {
        return this.get<User>('users', id, 'Users');
    }

    getAllUsers() {
        return this.getAll<User>('users', 'User');
    }

    addUser(data?: Partial<User>) {
        return this.add<User>('users', data, 'User', true);
    }

    setUser(data: User) {
        return this.set<User>('users', data, 'User');
    }

    updateUser(data: User) {
        return this.update<User>('users', data, 'User');
    }

    removeUser(id: string) {
        return this.remove('users', id);
    }

    /**
     * Projects
     */
    getProject(id?: string) {
        return this.get<Project>('projects', id, 'Projekte');
    }

    getAllProjects() {
        return this.getAll<Project>('projects', 'Projekt');
    }

    queryProjectsByUserId(userId: string = '') {
        return this.query<Project>('projects', 'userId', "==", userId);
    }

    addProject(data?: Partial<Project>) {
        return this.add<Project>('projects', data, 'Projekt', true);
    }

    setProject(data: Project) {
        return this.set<Project>('projects', data, 'Projekt');
    }

    updateProject(data: Project) {
        return this.update<Project>('projects', data, 'Projekt');
    }

    removeProject(id: string) {
        return this.remove('projects', id);
    }



    // Generic functions
    async getAll<T extends DocumentData>(collectionName: string, entityName = 'Dokumente'): Promise<T[]> {
        try {
            return this.toArray( await getDocs(collection(db, collectionName)) ) as T[];
        } catch (error) {
            const message = `Fehler beim Laden aller ${entityName} (${(error as Error).message})`;
            throw new Error(message);
        }
    }

    async get<T extends DocumentData>(collectionName: string, id: string = '', entityName = 'Dokuments'): Promise<T | null> {
        if (!id) return null;
        try {
            const entity = await getDoc(doc(collection(db, collectionName), id));
            return entity.data() as T ;
        } catch (error) {
            const message = `Fehler beim laden eines ${entityName} (${(error as Error).message})`;
            throw new Error(message);
        }
    }

    async add<T extends DocumentData>(collectionName: string, data?: Partial<T>, entityName = 'Dokument', isUser = false): Promise<T> {
        try {
            const docRef: DocumentReference = doc(collection(db, collectionName));
            const docPartial: DocumentData = {id: docRef.id};
            if (isUser) docPartial['userId'] = docRef.id;
            const newEntity: T = {...data, ...docPartial} as unknown as T;
            await setDoc(docRef, newEntity);
            return newEntity;
        } catch (error) {
            const message = `Fehler - ${entityName} nicht erstellt! (${(error as Error).message})`
            throw new Error(message);
        }
    }

    async set<T extends DocumentData>(collectionName: string, data: T, entityName = 'Dokument'): Promise<T> {
        try {
            await setDoc(doc(collection(db, collectionName), data['id']), data);
            return {...data};
        } catch (error) {
            const message = `Fehler - ${entityName} nicht gespeichert! (${(error as Error).message})`
            throw new Error(message);
        }
    }

    async update<T extends DocumentData>(collectionName: string, data: Partial<T>, entityName = 'Dokument'): Promise<T> {
        try {
            const {id, ...partialEntity} = data;
            await updateDoc(doc(collection(db, collectionName), id), partialEntity);
            const updatedEntity = await this.get<T>(collectionName, id);
            if (updatedEntity) return updatedEntity
            throw new Error('entity updated but cannot get updated entity data');
        } catch (error) {
            const message = `Fehler - ${entityName} nicht gespeichert! (${(error as Error).message})`
            throw new Error(message);
        }
    }

    async remove(collectionName: string, id: string, entityName = 'Dokument'): Promise<void> {
        try {
            await deleteDoc(doc(collection(db, collectionName), id));
        } catch (error) {
            const message = `Fehler - ${entityName} nicht gelöscht (${(error as Error).message})`;
            throw new Error(message);
        }
    }

    async query<T extends DocumentData>(collectionName: string, field: string, whereFilterOp: WhereFilterOp, value: any, entityName = 'Dokumenten'): Promise<T[] | null> {
        try {
            const q = query(collection(db, collectionName), where(field, whereFilterOp, value));
            const querySnapshot = await getDocs(q);
            if (querySnapshot.size === 0) return null;
            return querySnapshot.docs.map(x => x.data() as T);

        } catch (error) {
            const message = `Fehler beim laden eines Query von ${entityName} (${(error as Error).message})`;
            throw new Error(message);
        }
    }

}
