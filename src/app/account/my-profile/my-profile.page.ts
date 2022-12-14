import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {
  AlertController,
  LoadingController,
  ToastController,
} from '@ionic/angular';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, onValue, update } from 'firebase/database';
import {
  getStorage,
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import { UserConstant } from 'src/app/appConstants/userConstants';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.page.html',
  styleUrls: ['./my-profile.page.scss'],
})
export class MyProfilePage implements OnInit {
  private loading: any;
  public staffId: any;
  public imgSrc: any;
  selectedImage: any = null;
  public isProfilePicChanged: boolean = false;
  editValue: boolean = true;
  public staffDetail: any = [];
  public updateForm: any;
  public auth = getAuth();
  public database = getDatabase();
  public currentUser: any = UserConstant.currentUser;

  constructor(
    private router: Router,
    private alertController: AlertController,
    private staffDetailLoadingControl: LoadingController,
    private formBuilder: FormBuilder,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.checkUserLoggedIn();
  }

  checkUserLoggedIn() {
    const user = this.auth.currentUser;
    if (user !== null) {
      this.staffId = user.uid;
      this.getstaffDetail();
    } else {
      this.router.navigateByUrl('/splash');
    }
  }

  async createUpdateForm(staffDetail: any) {
    this.updateForm = this.formBuilder.group({
      firstName: new FormControl(staffDetail['firstName'], [
        Validators.required,
      ]),
      lastName: new FormControl(staffDetail['lastName'], [Validators.required]),
      dateOfBirth: new FormControl(staffDetail['dateOfBirth'], [
        Validators.required,
      ]),
      phoneNumber: new FormControl(staffDetail['phoneNumber'], [
        Validators.required,
      ]),
      email: new FormControl(staffDetail['email'], [Validators.required]),
      gender: new FormControl(
        { value: staffDetail['gender'], disabled: true },
        [Validators.required]
      ),
      bloodGroup: new FormControl(
        { value: staffDetail['bloodGroup'], disabled: true },
        [Validators.required]
      ),
      joiningDate: new FormControl(staffDetail['joiningDate'], [
        Validators.required,
      ]),
      presentAddress: new FormControl(staffDetail['presentAddress'], [
        Validators.required,
      ]),
      permanentAddress: new FormControl(staffDetail['permanentAddress'], [
        Validators.required,
      ]),
      aadhaarNumber: new FormControl(staffDetail['aadhaarNumber'], [
        Validators.required,
      ]),
      role: new FormControl(staffDetail['role'], [Validators.required]),
      isActive: new FormControl(staffDetail['isActive'], [Validators.required]),
      isPrincipal: new FormControl(staffDetail['isPrincipal'], [
        Validators.required,
      ]),
      profilePic: new FormControl(),
    });
    await this.dismissLoadingController();
  }

  getstaffDetail() {
    const studentRef = ref(this.database, `users/${this.staffId}`);

    onValue(studentRef, async (snapshot) => {
      await this.pleaseWaitLoader();
      if (snapshot.val() == null) {
        await this.dismissLoadingController();
        return;
      }
      this.staffDetail = snapshot.val();
      this.imgSrc = this.staffDetail['profilePic'];
      this.createUpdateForm(this.staffDetail);
    });
  }

  toggleEdit() {
    if (this.editValue == false) {
      this.editValue = true;
      this.updateForm.get('gender')?.disable();
      this.updateForm.get('bloodGroup')?.disable();
    }
    else {
      this.editValue = false;
      this.updateForm.get('gender')?.enable();
      this.updateForm.get('bloodGroup')?.enable();
    }
  }

  async save() {
    const alert = await this.alertController.create({
      header: 'Are you sure?',
      cssClass: 'custom-alert',
      buttons: [
        {
          text: 'No',
          cssClass: 'alert-button-cancel',
        },
        {
          text: 'Yes',
          cssClass: 'alert-button-confirm',
          handler: async () => {
            alert.dismiss();
            await this.pleaseWaitLoader();
            if (this.isProfilePicChanged) {
              this.uploadImage();
            } else {
              this.updateForm.value['profilePic'] =
                this.staffDetail['profilePic'];
              this.updateStaffForm();
            }
          },
        },
      ],
    });

    await alert.present();
  }

  async updateStaffForm() {
    update(ref(this.database, `users/${this.staffId}`), this.updateForm.value);
    this.editValue = true;
    await this.dismissLoadingController();
    this.presentToast('top', 'Updated profiles details!');
  }

  uploadImage() {
    const storage = getStorage();
    // Create the file metadata
    /** @type {any} */
    const metadata = {
      contentType: 'image/jpeg',
    };

    // Upload file and metadata to the object 'images/mountains.jpg'
    //const storageRefs = storageRef(storage, 'students/' + `${this.selectedImage.name.split('.').slice(0, -1).join('.')}_${new Date().getTime()}`);

    const storageRefs = storageRef(storage, 'users/' + `${this.staffId}`);
    const uploadTask = uploadBytesResumable(
      storageRefs,
      this.selectedImage,
      metadata
    );

    // Listen for state changes, errors, and completion of the upload.
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        this.presentToast('top', 'Upload is ' + progress + '% done');
        switch (snapshot.state) {
          case 'paused':
            this.presentToast('top', 'Upload is paused');
            break;
          case 'running':
            this.presentToast('top', 'Profile photo is uploading');
            break;
        }
      },
      (error) => {
        // A full list of error codes is available at
        // https://firebase.google.com/docs/storage/web/handle-errors
        switch (error.code) {
          case 'storage/unauthorized':
            // User doesn't have permission to access the object
            break;
          case 'storage/canceled':
            // User canceled the upload
            break;

          // ...

          case 'storage/unknown':
            // Unknown error occurred, inspect error.serverResponse
            break;
        }
      },

      () => {
        // Upload completed successfully, now we can get the download URL
        const data = getDownloadURL(uploadTask.snapshot.ref).then(
          async (downloadURL) => {
            this.updateForm.value['profilePic'] = downloadURL;
            this.updateStaffForm();
            await this.dismissLoadingController();
            this.presentToast(
              'top',
              'Updated profiles details with profile pic!'
            );
          }
        );
      }
    );
  }

  showPreview(event: any) {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => (this.imgSrc = e.target.result);
      reader.readAsDataURL(event.target.files[0]);
      this.selectedImage = event.target.files[0];
      this.isProfilePicChanged = true;
    } else {
      this.imgSrc = this.staffDetail['profilePic'];
      this.selectedImage = null;
      this.isProfilePicChanged = false;
    }
  }

  async presentToast(position: 'top' | 'middle' | 'bottom', message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: position,
    });

    await toast.present();
  }

  async pleaseWaitLoader() {
    this.loading = await this.staffDetailLoadingControl.create({
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
