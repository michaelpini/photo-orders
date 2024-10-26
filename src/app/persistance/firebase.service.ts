import {Injectable} from "@angular/core";
import {firebaseStore as db} from "../../main";
import {collection, doc, getDocs, getDoc, setDoc, QuerySnapshot, DocumentData, deleteDoc, updateDoc, DocumentReference, query, where} from "firebase/firestore";
import {User} from "../customers/user.model";

@Injectable({
    providedIn: 'root',
})
export class FirebaseService {

    private toArray(querySnapshot: QuerySnapshot<DocumentData>) {
        const data: DocumentData[] = []
        querySnapshot.forEach((doc) => {
            data.push(doc.data());
        });
        return data;
    }

    async addUser(): Promise<User> {
        try {
            const newUserRef: DocumentReference = doc(collection(db, "users"));
            const newUser: User = {
                id: newUserRef.id,
                auth: 'user',
                firstName: '[NEUER]',
                lastName: '[KUNDE]',
                uid: null,
                userName: null,
            };
            await setDoc(newUserRef, newUser);
            return newUser;
        } catch (error) {
            const message = `Fehler - User nicht erstellt! (${(error as Error).message})`
            throw new Error(message);
        }
    }

    async setUser(user: User): Promise<User> {
        try {
            await setDoc(doc(collection(db, "users"), user.id), user);
            return {...user};
        } catch (error) {
            const message = `Fehler - nicht gespeichert! (${(error as Error).message})`
            throw new Error(message);
        }
    }

    async updateUser(user: User): Promise<User> {
        try {
            const {id, ...partialUser} = user;
            await updateDoc(doc(collection(db, "users"), id), partialUser);
            const updatedUser = await this.getUser(id);
            if (updatedUser) return updatedUser
            throw new Error('user updated but cannot get updated user data');
        } catch (error) {
            const message = `Fehler - nicht gespeichert! (${(error as Error).message})`
            throw new Error(message);
        }
    }

    async getUser(id: string): Promise<User | null> {
        if (!id) return null;
        try {
            const user = await getDoc(doc(collection(db, "users"), id));
            return user.data() as User ;
        } catch (error) {
            const message = `Fehler beim laden eines Users (${(error as Error).message})`;
            throw new Error(message);
        }
    }

    async getUserByUid(uid: string): Promise<User | null> {
        if (!uid) return null;
        try {
            const q = query(collection(db, "users"), where("uid", "==", uid));
            const querySnapshot = await getDocs(q);
            if (querySnapshot.size === 1) {
                const user = querySnapshot.docs[0].data() as User ;
                return user;
            } else {
                return null;
            }
        } catch (error) {
            const message = `Fehler beim laden eines Users (${(error as Error).message})`;
            throw new Error(message);
        }
    }


    async getAllUsers(): Promise<User[]> {
        try {
            return this.toArray( await getDocs(collection(db, "users")) ) as User[];
        } catch (error) {
            const message = `Fehler beim Laden aller User (${(error as Error).message})`;
            throw new Error(message);
        }
    }

    async removeUser(id: string): Promise<void> {
        try {
            await deleteDoc(doc(collection(db, "users"), id));
        } catch (error) {
            const message = `Fehler - User nicht gelöscht (${(error as Error).message})`;
            throw new Error(message);
        }
    }

}
