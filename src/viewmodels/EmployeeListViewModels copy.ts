// src/viewmodels/EmployeeListViewModel.ts
import { EmployeeService } from "../services/EmployeeService.js";
import { Employee } from "../models/Employee.js";

export class EmployeeListViewModel {
  private service: EmployeeService;
  private listElement: HTMLElement | null;

  constructor(listElementId: string) {
    this.service = new EmployeeService();
    this.listElement = document.getElementById("employee-list");
  }

  async loadEmployees(): Promise<void> {
    try {
      const employees: Employee[] = await this.service.getAll();
      console.log("Fetched employees:", employees);
      this.render(employees);
    } catch (err: any) {
      console.error("Error loading employees", err);
      if (this.listElement) {
        this.listElement.innerHTML = `<li style="color:red">Error loading employees: ${err.message}</li>`;
      }
    }
  }

  private render(employees: Employee[]): void {
    if (!this.listElement) return;

    this.listElement.innerHTML = "";

    employees.forEach((emp) => {
      const li = document.createElement("li");
      li.textContent = `${emp.FirstName} ${emp.LastName} (${emp.SSN})`;

      // Add edit and delete buttons
      const editBtn = document.createElement("button");
      editBtn.textContent = "✏️ Edit";
      editBtn.onclick = () => {
        location.hash = `form?id=${emp.PersonID}`;
      };

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "🗑️ Delete";
      deleteBtn.onclick = () => {
        location.hash = `delete?id=${emp.PersonID}`;
      };

      li.appendChild(editBtn);
      li.appendChild(deleteBtn);
      this.listElement!.appendChild(li);
    });
  }
}
