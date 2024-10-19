import {Injectable} from "@angular/core";
import {firebaseStore as db} from "../../main";
import {collection, doc, getDocs, getDoc, setDoc, QuerySnapshot, DocumentData, deleteDoc} from "firebase/firestore";
import {User} from "../customers/user.model";

// const usersCollection = collection(db, "users");

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

    async setUser(user: User): Promise<User> {
        try {
            await setDoc(doc(collection(db, "users"), user.id), user);
            return {...user};
        } catch (error) {
            const message = `Fehler - nicht gespeichert! (${(error as Error).message})`
            throw new Error(message);
        }
    }
    async getUser(id: string): Promise<User | undefined> {
        if (!id) return undefined;
        try {
            const user = await getDoc(doc(collection(db, "users"), id));
            return user.data() as User ;
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
