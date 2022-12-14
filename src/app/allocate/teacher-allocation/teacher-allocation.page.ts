import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, query, orderByChild, onValue, get } from 'firebase/database';
import { MyClass } from 'src/app/models/myClass.model';
import { Teacher } from 'src/app/models/teacher.model';

@Component({
  selector: 'app-teacher-allocation',
  templateUrl: './teacher-allocation.page.html',
  styleUrls: ['./teacher-allocation.page.scss'],
})
export class TeacherAllocationPage implements OnInit {

  private loading:any
  year = new Date().getFullYear()
  allClasses: MyClass[] = []
  sourceAllClasses: MyClass[] = []
  public batchKey:any
  public tempData:any
  public database = getDatabase();
  public isSearch:boolean = false
  public searchString:string = ""
  public auth = getAuth();
  constructor(private activatedRouter: ActivatedRoute,private router:Router, private allocationLoadingControl: LoadingController) { }

  ngOnInit() {
    this.checkUserLoggedIn()
  }

  checkUserLoggedIn() {
    const user = this.auth.currentUser;
    if (user !== null) {
      this.activatedRouter.paramMap.subscribe(params => {
        this.batchKey = params.get('id')
        this.getClasses()
      })
    }
    else{
      this.router.navigateByUrl('/splash')
    }
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
          var classKey:any = childSnapshot.key
          this.getCount(classKey).then(value => {
            var tempObj: MyClass = childSnapshot.val()
            tempObj.classTeacher = teacher.firstName + " " + teacher.lastName
            tempObj.count = value
            tempObj.key = childSnapshot.key
            this.sourceAllClasses.push(tempObj);
            if (this.sourceAllClasses.length == totalClasses) {
              this.allClasses = this.sourceAllClasses
              this.dismissLoadingController()
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

  makeIsSearchable(){
    this.searchString = ""
    this.isSearch=!this.isSearch
    if(!this.isSearch){
      this.allClasses = this.sourceAllClasses
    }
  }

  handleChange(event: { target: { value: string; }; }) {
    const searchQuery = event.target.value.toLowerCase();
    if(searchQuery.length == 0 )
    {
      this.allClasses = this.sourceAllClasses
    }
    else{
      this.allClasses = this.sourceAllClasses.filter(element => element.className.toString().toLowerCase().includes(searchQuery)
                      || element.section.toLowerCase().includes(searchQuery) 
                      || element.classTeacher.toLowerCase().includes(searchQuery)
      )
    }
  }

  async pleaseWaitLoader() {
    this.loading = await this.allocationLoadingControl.create({
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