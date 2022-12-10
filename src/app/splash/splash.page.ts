import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
})
export class SplashPage implements OnInit {

  

  constructor(private router: Router) {}

  ngOnInit() {
    setTimeout(() => {
      const auth = getAuth(); 
      onAuthStateChanged(auth, (user) => {
        if (user) {
          this.router.navigateByUrl('home');
         } else {
           this.router.navigateByUrl('/sign-in');
         }
      });
    }, 2000);
  }
}
