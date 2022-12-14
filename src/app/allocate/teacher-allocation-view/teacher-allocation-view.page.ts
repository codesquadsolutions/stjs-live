import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, query, orderByChild, equalTo, onValue, update } from 'firebase/database';
import { UserConstant } from 'src/app/appConstants/userConstants';

@Component({
  selector: 'app-teacher-allocation-view',
  templateUrl: './teacher-allocation-view.page.html',
  styleUrls: ['./teacher-allocation-view.page.scss'],
})
export class TeacherAllocationViewPage implements OnInit {

  private loading: any
  classKey: any
  staffs: any
  allocationDetails: object = []
  database = getDatabase();
  editValue: boolean = false
  public allocationForm: any
  batchKey: any
  public auth = getAuth();
  public isClassTeacher:boolean = false
  public currentUser: any = UserConstant.currentUser

  constructor(private allocationViewAlertController: AlertController, private router: Router, private activatedRouter: ActivatedRoute, private toastController: ToastController, private formBuilder: FormBuilder, private allocationViewLoadingControl: LoadingController) { }

  ngOnInit() {
    this.checkUserLoggedIn()
  }

  checkUserLoggedIn() {
    const user = this.auth.currentUser;
    if (user !== null) {
      this.activatedRouter.paramMap.subscribe(params => {
        this.classKey = params.get('id')
        this.batchKey = params.get('batchKey')
        this.getClassInfo()
        this.getTeachersList()
        this.getTeacherAllocation()
      })
    }
    else {
      this.router.navigateByUrl('/splash')
    }
  }

  getClassInfo() {
    const classesRef = ref(this.database, `classes/${this.batchKey}/${this.classKey}`);
    const classQuery = query(classesRef);

    onValue(classQuery, (snapshot) => {
      const user = this.auth.currentUser;
      if (user !== null) {
        if (user.uid == snapshot.val().classTeacher)
          this.isClassTeacher = true
      }
    })
  }

  getTeachersList() {
    const staffRef = ref(this.database, `users`);
    const staffQuery = query(staffRef, orderByChild('role'), equalTo('Teacher'));

    onValue(staffQuery, (snapshot) => {
      this.staffs = snapshot.val()
    });
  }

  getTeacherAllocation() {
    const starCountRef = ref(this.database, 'teacherAllocation/' + this.classKey);
    onValue(starCountRef, async (snapshot) => {
      await this.pleaseWaitLoader()
      this.allocationDetails = snapshot.val();
      if (!this.allocationDetails) {
        this.allocationDetails = { kannada: "", english: "", mathematics: "", science: "", socialScience: "", hindi: "" }
        this.createAllocationForm(this.allocationDetails)
      }
      else {
        this.createAllocationForm(this.allocationDetails)
      }
    });
  }

  async createAllocationForm(allocationDetail: any) {
    this.allocationForm = this.formBuilder.group({
      kannada: new FormControl({ value: allocationDetail['kannada'], disabled: true }, Validators.required),
      english: new FormControl({ value: allocationDetail['english'], disabled: true }, Validators.required),
      mathematics: new FormControl({ value: allocationDetail['mathematics'], disabled: true }, Validators.required),
      science: new FormControl({ value: allocationDetail['science'], disabled: true }, Validators.required),
      socialScience: new FormControl({ value: allocationDetail['socialScience'], disabled: true }, Validators.required),
      hindi: new FormControl({ value: allocationDetail['hindi'], disabled: true }, Validators.required),
    })
    await this.dismissLoadingController()
  }

  enableEdit() {
    this.editValue = true
    this.allocationForm.get('kannada')?.enable();
    this.allocationForm.get('english')?.enable();
    this.allocationForm.get('mathematics')?.enable();
    this.allocationForm.get('science')?.enable();
    this.allocationForm.get('socialScience')?.enable();
    this.allocationForm.get('hindi')?.enable();
  }

  disableEdit() {
    this.editValue = false
    this.allocationForm.get('kannada')?.disable();
    this.allocationForm.get('english')?.disable();
    this.allocationForm.get('mathematics')?.disable();
    this.allocationForm.get('science')?.disable();
    this.allocationForm.get('socialScience')?.disable();
    this.allocationForm.get('hindi')?.disable();
  }

  async save() {
    const alert = await this.allocationViewAlertController.create({
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
            this.updateAllocationForm()
          },
        },
      ],
    });

    await alert.present();

  }

  updateAllocationForm() {
    update(ref(this.database, `teacherAllocation/${this.classKey}`), this.allocationForm.value);
    this.editValue = false
    this.presentToast('top', "Respective teacher has been allocated to subjects!")
    this.dismissLoadingController()
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
    this.loading = await this.allocationViewLoadingControl.create({
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