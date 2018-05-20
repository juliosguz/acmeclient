import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {baseURL} from '../shared/baseUrl';
import {Employee} from '../shared/employee';
import 'rxjs/add/operator/map';
import 'rxjs/operator/delay';
import 'rxjs/operator/mergeMap';
import 'rxjs/operator/switchMap';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';


@Injectable()
export class EmployeeService {
  dataChange: BehaviorSubject<Employee[]> = new BehaviorSubject<Employee[]>([]);
  // Temporarily stores data from dialogs
  dialogData: any;

  constructor(private http: HttpClient) {
  }

  get data(): Employee[] {
    return this.dataChange.value;
  }

  getDialogData() {
    return this.dialogData;
  }

  getAllEmployees(): void {
    this.http.get<Employee[]>(baseURL + 'employees').subscribe(data => {
        this.dataChange.next(data);
      },
      (error: HttpErrorResponse) => {
        console.log(error.name + ' ' + error.message);
      });
  }

  getEmployee(id: number): Observable<Employee> {
    return this.http.get<Employee>(baseURL + 'employees/' + id)
      .map(res => {
        return res;
      });
  }

  getFeaturedEmployee(): Observable<Employee> {
    return this.http.get<Employee>(baseURL + 'employees?featured=true')
      .map(res => {
        return res[0];
      }).catch(error => {
        console.log('error: ' + error);
        return error;
      });
  }

  addEmployee(employee: Employee): void {
    this.http.post(baseURL + 'employees', employee).subscribe(data => {
        this.dialogData = employee;
        console.log('Successfully added');
      },
      (err: HttpErrorResponse) => {
        console.log('Error occurred. Details: ' + err.name + ' ' + err.message);
      });
  }

  updateEmployee(employee: Employee): void {
    this.http.put(baseURL + 'employees', employee).subscribe(data => {
        this.dialogData = employee;
        console.log('Successfully updated');
      },
      (err: HttpErrorResponse) => {
        console.log('Error occurred. Details: ' + err.name + ' ' + err.message);
      });
  }

  deleteEmployee(id: number): void {
    this.http.delete(baseURL + 'employees/' + id).catch(error => {
      console.log('error' + error);
      return error;
    });
  }
}
