import { Component, OnInit } from '@angular/core';
import { UserProfileModel } from 'src/app/models/userProfile.model';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getDatabase, ref, onValue, equalTo, orderByChild, query, limitToLast } from 'firebase/database';
import { Router } from '@angular/router';
import { UserConstant } from 'src/app/appConstants/userConstants';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.page.html',
  styleUrls: ['./my-account.page.scss'],
})
export class MyAccountPage implements OnInit {
  public currentUser: any = UserConstant.currentUser;
  public database = getDatabase();
  public auth = getAuth();
  public loggedInUserClass: any;
  public currentBatchKey: any;
  public loggedInUserProfile:any;
  public role:any

  constructor(
    private router: Router,
    private alertController: AlertController
  ) {}

  ngOnInit(): void {
    this.verifyUserLogin();
  }

  verifyUserLogin() {
    onAuthStateChanged(this.auth, (user) => {
      if (!user) {
        this.userSignOut();
      } else {
        const userRef = ref(this.database, 'users/' + user.uid);
        onValue(userRef, async (snapshot) => {
          this.loggedInUserProfile = snapshot.val();
          UserConstant.currentUser = this.loggedInUserProfile;
          if (!this.loggedInUserProfile.isActive) {
            this.userSignOut();
          } else {
            this.getCurrentBatchKey();
          }
          if (!this.loggedInUserProfile.isPrincipal) {
            this.getUserClassInfo();
          }
        });
      }
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

  async userSignOut() {
    const alert = await this.alertController.create({
      header: 'Are you sure?',
      cssClass: 'custom-alert',
      buttons: [
        {
          text: 'No',
          cssClass: 'alert-button-cancel',
          handler: async () => {
            alert.dismiss();
          },
        },
        {
          text: 'Yes',
          cssClass: 'alert-button-confirm',
          handler: async () => {
            alert.dismiss();
            signOut(this.auth)
              .then(() => {
                UserConstant.currentUser = null;
                this.router.navigateByUrl('/splash');
              })
              .catch((error) => {
                this.router.navigateByUrl('/home');
              });
          },
        },
      ],
    });

    await alert.present();
  }

  getCurrentBatchKey() {
    const lastQuote = query(
      ref(this.database, '/batches'),
      orderByChild('year'),
      limitToLast(1)
    );

    onValue(lastQuote, (snapshot) => {
      snapshot.forEach((childSnapshot) => {
        this.currentBatchKey = childSnapshot.key;
      });
    });
  }

  getUserClassInfo() {
    const user = this.auth.currentUser;
    if (user !== null) {
      const classesRef = ref(this.database, `classes/${this.currentBatchKey}`);
      const classQuery = query(
        classesRef,
        orderByChild('classTeacher'),
        equalTo(user.uid)
      );
      onValue(classQuery, async (snapshot) => {
        if (snapshot.val()) {
          for (let key in snapshot.val()) {
            if (snapshot.val()[key].classTeacher == user.uid) {
              this.loggedInUserClass = snapshot.val()[key].className + snapshot.val()[key].section;
              this.role = "Class Teacher"
            }
          }
        }
      });
    }
  }
}
