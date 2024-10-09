import {Injectable} from "@angular/core";
import {fbFs} from "../app.component";
import {collection, doc, getDocs, setDoc, QuerySnapshot, DocumentData} from "firebase/firestore";
import {User} from "../customers/customer.model";
const users = collection(fbFs, "users");

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
        await setDoc(doc(users, user.id), user);
        return {...user};
    }

    async getAllUsers(): Promise<User[]> {
        return this.toArray( await getDocs(users)) as User[];
    }

}
