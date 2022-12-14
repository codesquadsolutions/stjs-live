import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ref, onValue, getDatabase, update, orderByValue, query } from 'firebase/database';
import { getDownloadURL, getStorage, ref as storageRef, uploadBytesResumable } from "firebase/storage";
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { StudentProfile } from 'src/app/models/studentProfile.model';
import { getAuth } from 'firebase/auth';
import { UserConstant } from 'src/app/appConstants/userConstants';

@Component({
  selector: 'app-student-detail',
  templateUrl: './student-detail.page.html',
  styleUrls: ['./student-detail.page.scss'],
})
export class StudentDetailPage implements OnInit {

  private loading: any
  public imgSrc: any;
  selectedImage: any = null;
  public isSubmitted: boolean = false
  public isProfilePicChanged: boolean = false
  uploadedImageURL: any
  classKey: any
  batchKey: any
  editValue: boolean = true
  isPopoverOpen: boolean = false
  public studentId: any
  public studentDetail: any
  public database = getDatabase();
  public updateForm: any
  public auth = getAuth();
  public isClassTeacher: boolean = false
  public currentUser: any = UserConstant.currentUser

  constructor(private router: Router, private activatedRouter: ActivatedRoute, private alertController: AlertController, private studentDetailLoadingControl: LoadingController, public formBuilder: FormBuilder, private toastController: ToastController) { }


  ngOnInit() {
    this.checkUserLoggedIn()
  }

  checkUserLoggedIn() {
    const user = this.auth.currentUser;
    if (user !== null) {
      this.activatedRouter.paramMap.subscribe(params => {
        this.studentId = params.get('id')
        this.classKey = params.get('classKey')
        this.batchKey = params.get('batchKey')
        this.getStudentDetail()
        this.getClassInfo()
      })
    }
    else {
      this.router.navigateByUrl('/splash')
    }
  }

  getClassInfo() {
    const classesRef = ref(this.database, `classes/${this.batchKey}/${this.classKey}`);
    const classQuery = query(classesRef, orderByValue());

    onValue(classQuery, (snapshot) => {
      const user = this.auth.currentUser;
      if (user !== null) {
        if (user.uid == snapshot.val().classTeacher)
          this.isClassTeacher = true
      }
    })
  }

  async createUpdateForm(studentDetail: any) {
    this.updateForm = this.formBuilder.group({
      firstName: new FormControl(studentDetail['firstName'], [
        Validators.required
      ]),
      lastName: new FormControl(studentDetail['lastName'], [
        Validators.required
      ]),
      dateOfBirth: new FormControl(studentDetail['dateOfBirth'], [
        Validators.required
      ]),
      phoneNumber: new FormControl(studentDetail['phoneNumber'], [
        Validators.required
      ]),
      email: new FormControl(studentDetail['email'], [
        Validators.required
      ]),
      gender: new FormControl({ value: studentDetail['gender'], disabled: true }, [
        Validators.required
      ]),
      // gender: new FormControl({value:studentDetail['gender'], disabled: true}, [
      //   Validators.required
      // ]),
      bloodGroup: new FormControl({ value: studentDetail['bloodGroup'], disabled: true }, [
        Validators.required
      ]),
      joiningDate: new FormControl(studentDetail['joiningDate'], [
        Validators.required
      ]),
      presentAddress: new FormControl(studentDetail['presentAddress'], [
        Validators.required
      ]),
      permanentAddress: new FormControl(studentDetail['permanentAddress'], [
        Validators.required
      ]),
      aadhaarNumber: new FormControl(studentDetail['aadhaarNumber'], [
        Validators.required
      ]),
      role: new FormControl(studentDetail['role'], [
        Validators.required
      ]),
      isActive: new FormControl(studentDetail['isActive'], [
        Validators.required
      ]),
      profilePic: new FormControl()
    })
    await this.dismissLoadingController()
  }

  getStudentDetail() {

    const studentRef = ref(this.database, `users/${this.studentId}`);

    onValue(studentRef, async (snapshot) => {
      await this.pleaseWaitLoader()
      if (snapshot.val() == null) {
        await this.dismissLoadingController()
        return
      }
      this.studentDetail = snapshot.val()
      this.imgSrc = this.studentDetail['profilePic']
      this.createUpdateForm(this.studentDetail)
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
            alert.dismiss()
            await this.pleaseWaitLoader()
            if (this.isProfilePicChanged) {
              this.uploadImage()
            }
            else {
              this.updateForm.value['profilePic'] = this.studentDetail['profilePic']
              this.updateStudentForm()
              this.presentToast('top', "Updated profiles details!")
            }
          },
        },
      ],
    });

    await alert.present();

  }

  async updateStudentForm() {
    update(ref(this.database, `users/${this.studentId}`), this.updateForm.value);
    this.editValue = true
    await this.dismissLoadingController()
  }

  uploadImage() {

    const storage = getStorage();

    // Create the file metadata
    /** @type {any} */
    const metadata = {
      contentType: 'image/jpeg'
    };

    const storageRefs = storageRef(storage, 'users/' + `${this.studentId}`);
    const uploadTask = uploadBytesResumable(storageRefs, this.selectedImage, metadata);

    // Listen for state changes, errors, and completion of the upload.
    uploadTask.on('state_changed',
      (snapshot) => {
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        this.presentToast('top', "Upload is " + progress + "% done")
        switch (snapshot.state) {
          case 'paused':
            this.presentToast('top', "Upload is paused")
            break;
          case 'running':
            this.presentToast('top', "Profile photo uploading...")
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

          case 'storage/unknown':
            // Unknown error occurred, inspect error.serverResponse
            break;
        }
      },

      () => {
        // Upload completed successfully, now we can get the download URL
        const data = getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
          this.updateForm.value['profilePic'] = downloadURL
          this.updateStudentForm()
          await this.dismissLoadingController()
          this.presentToast('top', "Updated profiles details with profile pic!")
        });
      }
    );

  }

  showPreview(event: any) {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => this.imgSrc = e.target.result;
      reader.readAsDataURL(event.target.files[0]);
      this.selectedImage = event.target.files[0];
      this.isProfilePicChanged = true
    }
    else {
      this.imgSrc = this.studentDetail['profilePic'];
      this.selectedImage = null;
      this.isProfilePicChanged = false
    }
  }

  async presentToast(position: 'top' | 'middle' | 'bottom', message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: position
    });

    await toast.present();
  }

  async pleaseWaitLoader() {
    this.loading = await this.studentDetailLoadingControl.create({
      message: 'Please wait...',
      mode: 'md',
      backdropDismiss: false,
    });
    await this.loading.present();
  }

  async dismissLoadingController() {
    await this.loading.dismiss();
  }

  async disableUserLogin() {
    this.updateForm.value['isActive'] = false
    this.updateForm.value['profilePic'] = this.studentDetail['profilePic']
    this.updateStudentForm()
    return
  }

  async enableUserLogin() {
    this.updateForm.value['isActive'] = true
    this.updateForm.value['profilePic'] = this.studentDetail['profilePic']
    this.updateStudentForm()
    return
  }

}