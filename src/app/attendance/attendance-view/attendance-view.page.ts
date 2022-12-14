import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, AlertController } from '@ionic/angular';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, query, orderByValue, onValue, get, orderByChild, equalTo } from 'firebase/database';
import { ViewAttendanceModel } from 'src/app/models/viewAttendance.model';

@Component({
  selector: 'app-attendance-view',
  templateUrl: './attendance-view.page.html',
  styleUrls: ['./attendance-view.page.scss'],
})
export class AttendanceViewPage implements OnInit {

  private loading: any
  public classId: any
  public batchKey: any
  public className: any
  attendanceData: any
  public attendanceList: ViewAttendanceModel[] = []
  sourceAttendanceList: ViewAttendanceModel[] = []
  public totalClassesTaken: number = 0
  public database = getDatabase();
  public auth = getAuth();
  constructor(private viewAttendanceLoadingControl: LoadingController, private activatedRouter: ActivatedRoute, private router: Router, private alertController: AlertController) { }

  ngOnInit() {
    this.checkUserLoggedIn()
  }

  checkUserLoggedIn() {
    const user = this.auth.currentUser;
    if (user !== null) {
      this.activatedRouter.paramMap.subscribe(params => {
        this.batchKey = params.get('batchKey')
        this.classId = params.get('id')
        this.getClassInfo()
      })
      this.getAttendanceList()
    }
    else {
      this.router.navigateByUrl('/splash')
    }
  }

  getClassInfo() {
    const classesRef = ref(this.database, `classes/${this.batchKey}/${this.classId}`);
    const classQuery = query(classesRef, orderByValue());

    onValue(classQuery, (snapshot) => {
      this.className = snapshot.val().className + snapshot.val().section
    }
    )
  }

  getAttendanceList() {
    const studentsRef = ref(this.database, `attdce/${this.classId}`);
    const studentsQuery = query(studentsRef);

    onValue(studentsQuery, async (snapshot) => {
      this.sourceAttendanceList = []
      this.attendanceList = []
      this.attendanceData = []
      await this.pleaseWaitLoader()
      if (snapshot.val() == null) {
        await this.dismissLoadingController()
        return
      }
      this.attendanceData = snapshot.val()
      var totalStudents = snapshot.size
      snapshot.forEach(element => {
        var studentKey: any = element.key
        this.getStudent(studentKey).then(studentObj => {
          this.getAttendanceStatus(studentKey).then(async childsnapshot => {
            var tempObj: ViewAttendanceModel = { studentKey: "", name: "", profilePic: "", attendanceKey: "", attendanceCount: 0 }
            tempObj.studentKey = element.key
            tempObj.name = studentObj.firstName + " " + studentObj.lastName
            tempObj.profilePic = studentObj.profilePic
            tempObj.attendanceCount = childsnapshot
            this.sourceAttendanceList.push(tempObj)
            if (this.sourceAttendanceList.length == totalStudents) {
              this.attendanceList = this.sourceAttendanceList
              await this.dismissLoadingController()
            }

          })
        })
      })
    })
  }

  async getStudent(studentId: string): Promise<any> {
    const db = getDatabase();
    var student: any;
    const snapshot = await get(ref(db, `users/${studentId}`))
    student = snapshot.val();
    return student;
  }

  async getAttendanceStatus(studentId: string): Promise<any> {
    const db = getDatabase();
    this.totalClassesTaken = (await get(ref(db, `attdce/${this.classId}/${studentId}`))).size
    const status = (await get(query(ref(db, `attdce/${this.classId}/${studentId}`), orderByChild("morning"), equalTo(true)))).size
    return status;
  }

  async pleaseWaitLoader() {
    this.loading = await this.viewAttendanceLoadingControl.create({
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