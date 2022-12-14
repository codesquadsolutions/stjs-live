import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { child, get, getDatabase, onValue, ref } from 'firebase/database';
import { environment } from 'src/environments/environment.prod';
@Injectable({
  providedIn: 'root'
})
export class UserdataService {
  public auth = getAuth()
  constructor() {

    initializeApp(environment.firebaseConfig);
  }

  verifyuser() {
    onAuthStateChanged(this.auth, (user) => {
      if (!user) {
        console.log("user logout")
      } else {

      }
    })
  }

  getBatchData(): any {
    const db = getDatabase();
    const starCountRef = ref(db, 'batches');
    onValue(starCountRef, async (snapshot) => {
      const data = await snapshot.val();
      console.log(data);
      return data;
    });
  }

  getOneTimeData():any {
    const dbRef = ref(getDatabase());
    get(child(dbRef, `/batches`)).then((snapshot) => {
      if (snapshot.exists()) {
        // console.log(snapshot.val());
        return snapshot.val()
      } else {
        console.log("No data available");
      }
    }).catch((error) => {
      console.error(error);
    });

  }
}

