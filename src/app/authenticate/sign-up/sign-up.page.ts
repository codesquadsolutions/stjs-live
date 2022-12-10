import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
})
export class SignUpPage implements OnInit {

  public signUpForm: any

  constructor(public formBuilder: FormBuilder, private router:Router) { }

  ngOnInit() {
    this.createSignInForm()
  }

  signUp() {


    const auth = getAuth();
    createUserWithEmailAndPassword(auth, this.signUpForm.value.email, this.signUpForm.value.password)
      .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        this.router.navigateByUrl('/home')
        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode,errorMessage)
        // ..
      });
  }

  createSignInForm() {
    this.signUpForm = this.formBuilder.group({

      email: new FormControl("", [
        Validators.required
      ]),
      password: new FormControl("", [
        Validators.required
      ])


    })
  }

}
