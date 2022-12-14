import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, query, orderByChild, equalTo, onValue } from 'firebase/database';
import { Staff } from 'src/app/models/staff.model';

@Component({
  selector: 'app-staff',
  templateUrl: './staff.page.html',
  styleUrls: ['./staff.page.scss'],
})
export class StaffPage implements OnInit {

  private loading:any
  public database = getDatabase();
  staffs: Staff[] = []
  sourceStaffs: Staff[] = []
  public staffKey: any
  public pageTitle: string = ""
  public searchString: string = ""
  public isSearch: boolean = false
  public auth = getAuth();
  
  constructor(private router:Router,private activatedRouter: ActivatedRoute, private staffLoadingControl: LoadingController) { }

  ngOnInit() {
    this.checkUserLoggedIn()
  }

  checkUserLoggedIn() {
    const user = this.auth.currentUser;
    if (user !== null) {
      this.activatedRouter.paramMap.subscribe(params => {
        this.staffKey = params.get('id')
        if (this.staffKey == "Teacher")
          this.pageTitle = "Teaching Staff"
        else
          this.pageTitle = "Non Teaching Staff"
        this.getTeachersList()
      })
    }
    else {
      this.router.navigateByUrl('/splash')
    }
  }

  getTeachersList() {
    
    const staffRef = ref(this.database, `users`);

    const staffQuery = query(staffRef, orderByChild('role'), equalTo(this.staffKey));

    onValue(staffQuery, async (snapshot) => {
      await this.pleaseWaitLoader()
      if (snapshot.val() == null) {
        await this.dismissLoadingController()
        return
      }
      const totalStaffs = snapshot.size
      this.sourceStaffs = []
      snapshot.forEach(childSnapshot => {
        var tempObj: Staff = childSnapshot.val()
        tempObj.key = childSnapshot.key
        this.sourceStaffs.push(tempObj)
        if (this.sourceStaffs.length == totalStaffs) {
          this.staffs = this.sourceStaffs
          this.dismissLoadingController()
        }
      });

    });
  }


  makeIsSearchable() {
    this.searchString = ""
    this.isSearch = !this.isSearch
    if (!this.isSearch) {
      this.staffs = this.sourceStaffs
    }
  }

  handleChange(event: { target: { value: string; }; }) {
    const searchQuery = event.target.value.toLowerCase();
    if (searchQuery.length == 0) {
      this.staffs = this.sourceStaffs
    }
    else {
      this.staffs = this.sourceStaffs.filter(element => element.firstName.toLowerCase().includes(searchQuery)
        || element.lastName.toLowerCase().includes(searchQuery)
      )
    }
  }

  async pleaseWaitLoader() {
    this.loading = await this.staffLoadingControl.create({
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

