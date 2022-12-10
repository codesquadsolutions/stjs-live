import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { format, parseISO } from 'date-fns';
import {
  getDatabase,
  ref,
  onValue,
  query,
  limitToLast,
  orderByChild,
  equalTo,
} from 'firebase/database';
import { UserProfileModel } from '../models/userProfile.model';
import { AlertController } from '@ionic/angular';
import { UserConstant } from '../appConstants/userConstants';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  public today: any;
  public greet: any;
  public year: any;
  public quote: any;
  public currentBatchKey: any;
  public loggedInUserClass: any;
  public loggedInUserProfile: UserProfileModel = {
    firstName: '',
    lastName: '',
    aadhaarNumber: '',
    bloodGroup: '',
    dateOfBirth: '',
    email: '',
    phoneNumber: '',
    gender: '',
    joiningDate: '',
    permanentAddress: '',
    presentAddress: '',
    profilePic: '',
    role: '',
    isActive: false,
    key: '',
    isPrincipal: false,
  };
  public auth = getAuth();
  public database = getDatabase();
  constructor(
    private router: Router,
    private alertController: AlertController
  ) { }

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
            const now = new Date();
            this.today = format(parseISO(now.toISOString()), 'dd-MM-yyyy');
            this.year = now.getFullYear();
            if(now.getHours()<12)
              this.greet = "Good Morning! Have a great day!"
            else if(now.getHours()<16)
              this.greet = "Good Afternoon"
            else if(now.getHours()<21)
              this.greet = "Good Evening"
            else
              this.greet = "Good Night, see you tomorrow!"
            this.getLastQuote();
            this.getCurrentBatchKey();
          }
          if (!this.loggedInUserProfile.isPrincipal) {
            this.getUserClassInfo();
          }
        });
      }
    });
  }

  async routeToAttendance() {
    if (this.loggedInUserClass == undefined) {
      const alert = await this.alertController.create({
        header: 'Permission denied!',
        subHeader: 'Only class teacher can take the attendance.',
        buttons: ['ok'],
      });
      await alert.present();
    } else {
      this.router.navigateByUrl(
        `/attendance-today/${this.currentBatchKey}/${this.loggedInUserClass}`
      );
    }
  }

  async routeToClasses() {
    this.router.navigateByUrl(`/classes/${this.currentBatchKey}`);
  }

  async routeToTimeTable() {
    const alert = await this.alertController.create({
      header: 'Alert',
      message: 'This feature will be enabled in the next update.',
      buttons: ['OK'],
    });

    await alert.present();
  }

  async routeToMyAccount() {
    this.router.navigateByUrl(`/my-account`);
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
              this.loggedInUserClass = key;
            }
          }
        }
      });
    }
  }

  getLastQuote() {
    const quotesRef = ref(this.database, 'quotes/');

    const lastQuote = query(quotesRef, limitToLast(1));

    onValue(lastQuote, (snapshot) => {
      snapshot.forEach((element) => {
        this.quote = element.val().quote;
      });
    });
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

  userSignOut() {
    signOut(this.auth)
      .then(() => {
        UserConstant.currentUser = null;
        this.router.navigateByUrl('/sign-in');
      })
      .catch((error) => {
        this.router.navigateByUrl('/sign-in');
      });
  }

  async showImg() {
    const alert = await this.alertController.create({
      // header: 'Alert',
      // subHeader: 'Important message',
      message: `<img src="${this.loggedInUserProfile.profilePic}" alt="g-maps" style="border-radius: 2px; height:100px;width:100px;">`,
      buttons: ['OK'],
    });

    await alert.present();
  }

}
