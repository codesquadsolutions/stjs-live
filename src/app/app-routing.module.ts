import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'splash',
    pathMatch: 'full'
  },
  {
    path: 'sign-up',
    loadChildren: () => import('./authenticate/sign-up/sign-up.module').then( m => m.SignUpPageModule)
  },
  {
    path: 'sign-in',
    loadChildren: () => import('./authenticate/sign-in/sign-in.module').then( m => m.SignInPageModule)
  },
  {
    path: 'splash',
    loadChildren: () => import('./splash/splash.module').then( m => m.SplashPageModule)
  },
  {
    path: 'batches',
    loadChildren: () => import('./academic/batch/batch.module').then( m => m.BatchPageModule)
  },
  {
    path: 'classes/:id',
    loadChildren: () => import('./academic/classes/classes.module').then( m => m.ClassesPageModule)
  },
  {
    path: 'students/:batchKey/:id',
    loadChildren: () => import('./academic/students/students.module').then( m => m.StudentsPageModule)
  },
  {
    path: 'student-detail/:batchKey/:classKey/:id',
    loadChildren: () => import('./academic/student-detail/student-detail.module').then( m => m.StudentDetailPageModule)
  },
  {
    path: 'staff/:id',
    loadChildren: () => import('./account/staff/staff.module').then( m => m.StaffPageModule)
  },
  {
    path: 'staff-detail/:id',
    loadChildren: () => import('./account/staff-detail/staff-detail.module').then( m => m.StaffDetailPageModule)
  },
  {
    path: 'teacher-allocation/:id',
    loadChildren: () => import('./allocate/teacher-allocation/teacher-allocation.module').then( m => m.TeacherAllocationPageModule)
  },
  {
    path: 'teacher-allocation-view/:batchKey/:id',
    loadChildren: () => import('./allocate/teacher-allocation-view/teacher-allocation-view.module').then( m => m.TeacherAllocationViewPageModule)
  },
  {
    path: 'attendance-today/:batchKey/:id',
    loadChildren: () => import('./attendance/attendance-today/attendance-today.module').then( m => m.AttendanceTodayPageModule)
  },
  {
    path: 'attendance-view/:batchKey/:id',
    loadChildren: () => import('./attendance/attendance-view/attendance-view.module').then( m => m.AttendanceViewPageModule)
  },
  {
    path: 'attendance-update/:batchKey/:id/:date',
    loadChildren: () => import('./attendance/attendance-update/attendance-update.module').then( m => m.AttendanceUpdatePageModule)
  },
  {
    path: 'my-profile',
    loadChildren: () => import('./account/my-profile/my-profile.module').then( m => m.MyProfilePageModule)
  }
  
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
