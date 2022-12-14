import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, IonModal, LoadingController } from '@ionic/angular';
import { getAuth } from 'firebase/auth';
import { get, getDatabase, onValue, orderByValue, query, ref, } from 'firebase/database';
import { UserConstant } from 'src/app/appConstants/userConstants';
import { Student } from 'src/app/models/student.model';

@Component({
  selector: 'app-students',
  templateUrl: './students.page.html',
  styleUrls: ['./students.page.scss'],
})
export class StudentsPage implements OnInit {
  public email: any;
  public password: any;
  public firstName: any;
  public lastName: any;
  public dateOfBirth: any;
  public gender: any;
  public phoneNumber: any;
  public bloodGroup: any;
  public joiningDate: any;
  public presentAddress: any;
  public permanentAddress: any;
  public aadhaarNumber: any;
  private loading: any;
  sourceStudentList: Student[] = [];
  studentList: Student[] = [];
  public classId: any;
  public batchKey: any;
  public className: any;
  searchString: string = '';
  isSearch: boolean = false;
  public isClassTeacher: boolean = false;
  public currentUser: any = UserConstant.currentUser;
  @ViewChild(IonModal) modal?: IonModal;
  public auth = getAuth();
  public database = getDatabase();
  constructor(
    private router: Router,
    private alertController: AlertController,
    private activatedRouter: ActivatedRoute,
    private studentLoadingControl: LoadingController
  ) { }

  ngOnInit() {
    this.checkUserLoggedIn();
  }

  checkUserLoggedIn() {
    const user = this.auth.currentUser;
    if (user !== null) {
      this.activatedRouter.paramMap.subscribe((params) => {
        this.classId = params.get('id');
        this.batchKey = params.get('batchKey');
        this.getClassInfo();
        this.getStudentsList();
      });
    } else {
      this.router.navigateByUrl('/splash');
    }
  }

  getClassInfo() {
    const classesRef = ref(
      this.database,
      `classes/${this.batchKey}/${this.classId}`
    );
    const classQuery = query(classesRef, orderByValue());

    onValue(classQuery, (snapshot) => {
      this.className = snapshot.val().className + snapshot.val().section;
      const user = this.auth.currentUser;
      if (user !== null) {
        if (user.uid == snapshot.val().classTeacher) this.isClassTeacher = true;
      }
    });
  }

  getStudentsList() {
    const studentsRef = ref(this.database, `classStudents/${this.classId}`);
    const studentsQuery = query(studentsRef);

    onValue(studentsQuery, async (snapshot) => {
      await this.pleaseWaitLoader();
      if (snapshot.val() == null) {
        await this.dismissLoadingController();
        return;
      }
      const totalStudents = snapshot.size;
      this.sourceStudentList = [];
      snapshot.forEach((element) => {
        var studentId: any = element.key;
        this.getStudent(studentId).then(async (value) => {
          var tempObj: Student = { name: '', key: '', profilePic: '' };
          tempObj.name = value.firstName + ' ' + value.lastName;
          tempObj.profilePic = value.profilePic;
          tempObj.key = element.key;
          this.sourceStudentList.push(tempObj);
          if (this.sourceStudentList.length == totalStudents) {
            this.studentList = this.sourceStudentList.sort();
            await this.dismissLoadingController();
          }
        });
      });
    });
  }

  async getStudent(studentId: string): Promise<any> {
    const db = getDatabase();
    var student: Student;
    const snapshot = await get(ref(db, `users/${studentId}`));
    student = snapshot.val();
    return student;
  }

  async pleaseWaitLoader() {
    this.loading = await this.studentLoadingControl.create({
      message: 'Please wait...',
      mode: 'md',
      backdropDismiss: false,
    });
    await this.loading.present();
  }

  async dismissLoadingController() {
    await this.loading.dismiss();
  }

  makeIsSearchable() {
    this.searchString = '';
    this.isSearch = !this.isSearch;
    if (!this.isSearch) {
      this.studentList = this.sourceStudentList;
    }
  }

  handleChange(event: { target: { value: string } }) {
    const searchQuery = event.target.value.toLowerCase();
    if (searchQuery.length == 0) {
      this.studentList = this.sourceStudentList;
    } else {
      this.studentList = this.sourceStudentList.filter(
        (element) =>
          element.name.toLowerCase().includes(searchQuery) ||
          element.name.toLowerCase().includes(searchQuery)
      );
    }
  }
}
