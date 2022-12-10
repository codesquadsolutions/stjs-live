import { Component } from '@angular/core';
import { initializeApp } from "firebase/app";
import { environment } from 'src/environments/environment.prod';
import { enableProdMode } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})

export class AppComponent {
  constructor() {
    initializeApp(environment.firebaseConfig);
    enableProdMode();
  }
}

