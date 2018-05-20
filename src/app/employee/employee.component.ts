import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {EmployeeService} from '../services/employee.service';
import {HttpClient} from '@angular/common/http';
import {MatDialog, MatPaginator, MatSort} from '@angular/material';
import {Employee} from '../shared/employee';
import {AddComponent} from './dialog/add/add.component';
import {EditComponent} from './dialog/edit/edit.component';
import {DeleteComponent} from './dialog/delete/delete.component';
import {BehaviorSubject, Observable} from 'rxjs';
import {DataSource} from '@angular/cdk/table';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.scss'],
  providers: [EmployeeService]
})
export class EmployeeComponent implements OnInit {
  displayedColumns = ['id', 'firstName', 'lastName', 'address', 'phone', 'email', , 'dni', 'jobPosition', 'actions'];
  dataBase: EmployeeService | null;
  dataSource: ExampleDataSource | null;
  index: number;
  id: number;

  constructor(public httpClient: HttpClient,
              public dialog: MatDialog,
              public employeeService: EmployeeService) {
  }

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('filter') filter: ElementRef;

  ngOnInit() {
    this.loadData();
  }

  refresh() {
    this.loadData();
  }

  addNew(employee: Employee) {
    const dialogRef = this.dialog.open(AddComponent, {
      data: {employee: employee}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 1) {
        // After dialog is closed we're doing frontend updates
        // For add we're just pushing a new row inside DataService
        this.dataBase.dataChange.value.push(this.employeeService.getDialogData());
        this.loadData();
        this.refreshTable();
      }
    });
  }

  startEdit(i: number, id: number, firstName: string, lastName: string, address: string, phone: string,
            email: string, dni: string, jobPosition: string) {
    this.id = id;
    // index row is used just for debugging proposes and can be removed
    this.index = i;
    console.log(this.index);
    const dialogRef = this.dialog.open(EditComponent, {
      data: {
        id: id, firstName: firstName, lastName: lastName, address: address, phone: phone, email: email, dni: dni, jobPosition: jobPosition
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 1) {
        // When using an edit things are little different, firstly we find record inside DataService by id
        const foundIndex = this.dataBase.dataChange.value.findIndex(x => x.id === this.id);
        // Then you update that record using data from dialogData (values you enetered)
        this.dataBase.dataChange.value[foundIndex] = this.employeeService.getDialogData();
        // And lastly refresh table
        this.refreshTable();
      }
    });
  }

  deleteItem(i: number, id: number, firstName: string, lastName: string, address: string, phone: string,
             email: string, dni: string, jobPosition: string) {
    this.index = i;
    this.id = id;
    const dialogRef = this.dialog.open(DeleteComponent, {
      data: {
        id: id, firstName: firstName, lastName: lastName, address: address, phone: phone, email: email, jobPosition: jobPosition
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 1) {
        const foundIndex = this.dataBase.dataChange.value.findIndex(x => x.id === this.id);
        // for delete we use splice in order to remove single object from DataService
        this.dataBase.dataChange.value.splice(foundIndex, 1);
        this.refreshTable();
      }
    });
  }


  // If you don't need a filter or a pagination this can be simplified, you just use code from else block
  private refreshTable() {
    // if there's a paginator active we're using it for refresh
    if (this.dataSource._paginator.hasNextPage()) {
      this.dataSource._paginator.nextPage();
      this.dataSource._paginator.previousPage();
      // in case we're on last page this if will tick
    } else if (this.dataSource._paginator.hasPreviousPage()) {
      this.dataSource._paginator.previousPage();
      this.dataSource._paginator.nextPage();
      // in all other cases including active filter we do it like this
    } else {
      this.dataSource.filter = '';
      this.dataSource.filter = this.filter.nativeElement.value;
    }
  }

  public loadData() {
    this.dataBase = new EmployeeService(this.httpClient);
    this.dataSource = new ExampleDataSource(this.dataBase, this.paginator, this.sort);
    Observable.fromEvent(this.filter.nativeElement, 'keyup')
      .debounceTime(150)
      .distinctUntilChanged()
      .subscribe(() => {
        if (!this.dataSource) {
          return;
        }
        this.dataSource.filter = this.filter.nativeElement.value;
      });
  }
}


export class ExampleDataSource extends DataSource<Employee> {
  _filterChange = new BehaviorSubject('');

  get filter(): string {
    return this._filterChange.value;
  }

  set filter(filter: string) {
    this._filterChange.next(filter);
  }

  filteredData: Employee[] = [];
  renderedData: Employee[] = [];

  constructor(public _employeeData: EmployeeService,
              public _paginator: MatPaginator,
              public _sort: MatSort) {
    super();
    // Reset to the first page when the user changes the filter.
    this._filterChange.subscribe(() => this._paginator.pageIndex = 0);
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<Employee[]> {
    // Listen for any changes in the base data, sorting, filtering, or pagination
    const displayDataChanges = [
      this._employeeData.dataChange,
      this._sort.sortChange,
      this._filterChange,
      this._paginator.page
    ];

    console.log('beforeeeee');
    this._employeeData.getAllEmployees();

    return Observable.merge(...displayDataChanges).map(() => {
      // Filter data
      this.filteredData = this._employeeData.data.slice().filter((employee: Employee) => {
        if (employee !== undefined) {
          const searchStr = (employee.id + employee.firstName + employee.lastName + employee.dni + employee.jobPosition +
            employee.featured).toLowerCase();
          return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
        }
      });

      // Sort filtered data
      const sortedData = this.sortData(this.filteredData.slice());

      // Grab the page's slice of the filtered sorted data.
      const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
      this.renderedData = sortedData.splice(startIndex, this._paginator.pageSize);
      return this.renderedData;
    });
  }

  disconnect() {
  }


  /** Returns a sorted copy of the database data. */
  sortData(data: Employee[]): Employee[] {
    if (!this._sort.active || this._sort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      let propertyA: number | string = '';
      let propertyB: number | string = '';

      switch (this._sort.active) {
        case 'id':
          [propertyA, propertyB] = [a.id, b.id];
          break;
        case 'firstName':
          [propertyA, propertyB] = [a.firstName, b.firstName];
          break;
        case 'lastName':
          [propertyA, propertyB] = [a.lastName, b.lastName];
          break;
        case 'address':
          [propertyA, propertyB] = [a.address, b.address];
          break;
        case 'phone':
          [propertyA, propertyB] = [a.phone, b.phone];
          break;
        case 'email':
          [propertyA, propertyB] = [a.email, b.email];
          break;
        case 'dni':
          [propertyA, propertyB] = [a.dni, b.dni];
          break;
        case 'jobPosition':
          [propertyA, propertyB] = [a.jobPosition, b.jobPosition];
          break;
        /* case 'created_at':
           [propertyA, propertyB] = [a.jobDescription, b.jobDescription];
           break;
         case 'updated_at':
           [propertyA, propertyB] = [a.jobPosition, b.jobPosition];*/
        // break;
      }

      const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

      return (valueA < valueB ? -1 : 1) * (this._sort.direction === 'asc' ? 1 : -1);
    });
  }

}
