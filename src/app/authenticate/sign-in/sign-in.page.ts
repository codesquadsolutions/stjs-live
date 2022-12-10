import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { ref, onValue, getDatabase } from 'firebase/database';
import { UserConstant } from 'src/app/appConstants/userConstants';
import { UserProfileModel } from 'src/app/models/userProfile.model';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.page.html',
  styleUrls: ['./sign-in.page.scss'],
})
export class SignInPage implements OnInit {
  private loading: any;
  public signInForm: any;
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
  public database = getDatabase();
  constructor(
    public formBuilder: FormBuilder,
    private router: Router,
    private signInLoadingControl: LoadingController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.checkUserLoggedIn();
  }

  async checkUserLoggedIn() {
    await this.pleaseWaitLoader();
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.router.navigateByUrl('/home');
      } else {
        this.createSignInForm();
      }
    });
  }

  async signIn() {
    await this.pleaseWaitLoader();
    const auth = getAuth();
    signInWithEmailAndPassword(
      auth,
      this.signInForm.value.email,
      this.signInForm.value.password
    )
      .then((userCredential) => {
        const user = userCredential.user;
        const userRef = ref(this.database, 'users/' + user.uid);
        onValue(userRef, async (snapshot) => {
          this.loggedInUserProfile = snapshot.val();
          if (this.loggedInUserProfile.isActive) {
            this.dismissLoadingController();
            this.router.navigateByUrl('/home');
          } else {
            this.dismissLoadingController();
            this.router.navigateByUrl('/splash');
          }
        });
      })
      .catch(async (error) => {
        this.dismissLoadingController();
        const alert = await this.alertController.create({
          header: 'Error!',
          subHeader:'Wrong Username or Password!',
          message: 'Please enter right username and password.',
          buttons: ['OK'],
        });
        await alert.present();
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
      });
  }

  createSignInForm() {
    this.signInForm = this.formBuilder.group({
      email: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
    });
    this.dismissLoadingController();
  }

  async pleaseWaitLoader() {
    this.loading = await this.signInLoadingControl.create({
      message: 'Please wait...',
      mode: 'md',
      backdropDismiss: false,
    });
    await this.loading.present();
  }
  async dismissLoadingController() {
    await this.loading.dismiss();
  }
}
