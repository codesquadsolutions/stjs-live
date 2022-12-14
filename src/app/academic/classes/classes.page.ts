import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonModal, LoadingController } from '@ionic/angular';
import { getDatabase, ref, query, orderByValue, onValue, orderByChild, get, push, child, equalTo, update } from 'firebase/database';
import { MyClass } from 'src/app/models/myClass.model';
import { Teacher } from 'src/app/models/teacher.model';
import { OverlayEventDetail } from '@ionic/core/components';
import { getAuth } from 'firebase/auth';
import { UserConstant } from 'src/app/appConstants/userConstants';

@Component({
  selector: 'app-classes',
  templateUrl: './classes.page.html',
  styleUrls: ['./classes.page.scss'],
})
export class ClassesPage implements OnInit {

  private loading: any
  allClasses: MyClass[] = []
  sourceAllClasses: MyClass[] = []
  @ViewChild(IonModal) modal?: IonModal;
  isSearch: boolean = false
  public batchKey: any
  public year: any
  public className: any
  public section: any
  public classTeacher: any
  public database = getDatabase();
  alertController: any;
  staffs: any
  searchString: string = ""
  public auth = getAuth()
  public currentUser:any = UserConstant.currentUser
  constructor(private router: Router, private activatedRouter: ActivatedRoute, private classLoadingControl: LoadingController) { }

  ngOnInit() {
    this.checkUserLoggedIn()
  }

  checkUserLoggedIn() {
    const user = this.auth.currentUser;
    if (user !== null) {
      this.getTeachersList()
      this.activatedRouter.paramMap.subscribe(params => {
        this.batchKey = params.get('id')
        this.getBatchInfo()
        this.getClasses()
      })
    }
    else {
      this.router.navigateByUrl('/splash')
    }
  }

  getBatchInfo() {
    const batchRef = ref(this.database, `batches/${this.batchKey}`);
    const batchQuery = query(batchRef, orderByValue());

    onValue(batchQuery, (snapshot) => {
      this.year = snapshot.val().year
    }
    )
  }

  getClasses() {
    const classesRef = ref(this.database, `classes/${this.batchKey}`);
    const classQuery = query(classesRef, orderByChild('className'));

    onValue(classQuery, async (snapshot) => {
      await this.pleaseWaitLoader()
      if (snapshot.val() == null) {
        await this.dismissLoadingController()
        return
      }
      const totalClasses = snapshot.size
      this.sourceAllClasses = []
      snapshot.forEach((childSnapshot) => {
        let teacher: any
        this.getTeacher(childSnapshot.val().classTeacher).then(value => {
          teacher = value
          var searchKey: any = childSnapshot.key
          this.getCount(searchKey).then(async value => {
            var tempObj: MyClass = childSnapshot.val()
            tempObj.classTeacher = teacher.firstName + " " + teacher.lastName
            tempObj.count = value
            tempObj.key = childSnapshot.key
            this.sourceAllClasses.push(tempObj);
            if (this.sourceAllClasses.length == totalClasses) {
              this.allClasses = this.sourceAllClasses
              await this.dismissLoadingController()
            }
          })
        })
      })
    })
  }

  async getTeacher(teacherId: string): Promise<any> {
    const db = getDatabase();
    var teacher: Teacher;
    const snapshot = await get(ref(db, `users/${teacherId}`))
    teacher = snapshot.val();
    return teacher;
  }

  async getCount(classId: string): Promise<any> {
    const db = getDatabase();
    var studentCount: number
    const snapshot = await get(ref(db, `classStudents/${classId}`))
    studentCount = snapshot.size;
    return studentCount;
  }


  async pleaseWaitLoader() {
    this.loading = await this.classLoadingControl.create({
      message: 'Please wait...',
      mode: 'md',
      backdropDismiss: false,
    });
    await this.loading.present();
  }

  async dismissLoadingController() {
    await this.loading.dismiss();
  }

  cancel() {
    this.modal?.dismiss(null, 'cancel');
  }

  confirm() {
    this.modal?.dismiss(null, 'confirm');
    this.addClass()
  }

  onWillDismiss(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    if (ev.detail.role === 'confirm') {
      console.log(`Hello, ${ev.detail.data}!`)
    }
  }


  addClass() {
    var postClass = {
      className: this.className,
      section: this.section,
      classTeacher: this.classTeacher
    }
    const newClassKey = push(child(ref(this.database), `classes/${this.batchKey}`)).key;
    update(ref(this.database, `classes/${this.batchKey}/` + newClassKey), postClass);
    return
  }

  getTeachersList() {
    const staffRef = ref(this.database, `users`);

    const staffQuery = query(staffRef, orderByChild('role'), equalTo('Teacher'));

    onValue(staffQuery, (snapshot) => {
      this.staffs = snapshot.val()
    });
  }

  makeIsSearchable() {
    this.searchString = ""
    this.isSearch = !this.isSearch
    if (!this.isSearch) {
      this.allClasses = this.sourceAllClasses
    }
  }

  handleChange(event: { target: { value: string; }; }) {
    const searchQuery = event.target.value.toLowerCase();
    if (searchQuery.length == 0) {
      this.allClasses = this.sourceAllClasses
    }
    else {
      this.allClasses = this.sourceAllClasses.filter(element => element.className.toString().toLowerCase().includes(searchQuery)
        || element.section.toLowerCase().includes(searchQuery)
        || element.classTeacher.toLowerCase().includes(searchQuery)
      )
    }
  }
}







