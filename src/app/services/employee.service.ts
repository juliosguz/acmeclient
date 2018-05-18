import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {baseURL} from '../shared/baseUrl';
import {Employee} from '../shared/employee';

@Injectable()
export class EmployeeService {

  constructor(private http: HttpClient) {
  }

  getEmployees(): Observable<any> {
    return this.http.get(baseURL + 'employees')
      .map((res) => {
        return res;
      }).catch(error => {
        console.log('error: ' + error);
        return error;
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

  getEmployeeIds(): Observable<number[]> {
    return this.getEmployees()
      .map(employees => {
        return employees.map(employee => employee.id);
      }).catch(error => {
        console.log('error: ' + error);
        return error;
      });
  }

  addEmployee(employee: Employee): void {
    this.http.post(baseURL + 'employees/', employee).catch(error => {
      console.log('error: ' + error);
      return error;
    });
  }

  updateEmployee(employee: Employee): void {
    this.http.put(baseURL + 'employees/', employee).catch(error => {
      console.log('error: ' + error);
      return error;
    });
  }

  deleteEmployee(id: number): void {
    this.http.delete(baseURL + 'employees/' + id).catch(error => {
      console.log('error' + error);
      return error;
    });
  }
}
