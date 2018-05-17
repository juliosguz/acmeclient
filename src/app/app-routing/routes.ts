import {Routes} from '@angular/router';

import {HomeComponent} from '../home/home.component';
import {ContactComponent} from '../contact/contact.component';
import {AboutComponent} from '../about/about.component';
import {EmployeeComponent} from '../employee/employee.component';

export const routes: Routes = [
  { path: 'home',  component: HomeComponent },
  {path: 'employee', component: EmployeeComponent},
  { path: 'contact',     component: ContactComponent },
  { path: 'about',     component: AboutComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' }
];
