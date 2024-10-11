import {Injectable} from "@angular/core";
import {fireStore as db} from "../app.component";
import {collection, doc, getDocs, getDoc, setDoc, QuerySnapshot, DocumentData} from "firebase/firestore";
import {User} from "../customers/user.model";
//const users = collection(db, "users");

type Collections = 'users' | 'projects' | 'invoices'

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
        await setDoc(doc(collection(db, "users"), user.id), user);
        return {...user};
    }
    async getUser(id: string): Promise<User | undefined> {
        if (!id) return undefined;
        const user = await getDoc(doc(collection(db, "users"), id));
        return user.data() as User ;
    }

    async getAllUsers(): Promise<User[]> {
        return this.toArray( await getDocs(collection(db, "users")) ) as User[];
    }

}
