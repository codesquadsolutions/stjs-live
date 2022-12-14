import { Component, Inject } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { environment } from 'src/environments/environment.prod';
import { enableProdMode } from '@angular/core';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Router } from '@angular/router';
import { getDatabase, query, ref, orderByChild, limitToLast, onValue } from 'firebase/database';
import { UserConstant } from './appConstants/userConstants';
import { AlertController } from '@ionic/angular';
import { HomePage } from './home/home.page';
import { UserProfileModel } from './models/userProfile.model';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})

export class AppComponent {
  public currentBatchKey: any
  public loggedInUserClass: any;
  public loggedInUserProfile: any = {
    firstName: '',
    lastName: '',
  };
  constructor(private alertController:AlertController) {
    initializeApp(environment.firebaseConfig);
    enableProdMode();
    this.getCurrentBatchKey()
  }
  
  getCurrentBatchKey() {
    const db = getDatabase();
    const starCountRef = query(ref(db, 'batches/'), orderByChild('year'), limitToLast(1));
    onValue(starCountRef, (snapshot) => {
      snapshot.forEach(childSnapshot => {
        this.currentBatchKey = childSnapshot.key
      });
    });
  }

  async showInfoAlert() {
    const alert = await this.alertController.create({
      header: 'Alert',
      message: 'This feature will be enabled in the next update.',
      buttons: ['OK'],
    });

    await alert.present();
  }
}

