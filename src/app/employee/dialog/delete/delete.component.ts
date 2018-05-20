import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {EmployeeService} from '../../../services/employee.service';

@Component({
  selector: 'app-delete',
  templateUrl: './delete.component.html',
  styleUrls: ['./delete.component.scss']
})
export class DeleteComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<DeleteComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any, public employeeService: EmployeeService) {
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }

  confirmDelete(): void {
    this.employeeService.deleteEmployee(this.data.id);
  }

  ngOnInit() {
  }

}
