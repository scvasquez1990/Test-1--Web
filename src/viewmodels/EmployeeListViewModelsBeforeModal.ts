// src/viewmodels/EmployeeListViewModel.ts
import { EmployeeService } from "../services/EmployeeService.js";
import { Employee } from "../models/Employee.js";

export class EmployeeListViewModel {
  private service: EmployeeService;
  private listElement: HTMLElement | null;

  constructor(listElementId: string) {
    this.service = new EmployeeService();
    this.listElement = document.getElementById(listElementId);
  }

  async loadEmployees(): Promise<void> {
    try {
      const employees: Employee[] = await this.service.getAll();
      this.render(employees);
    } catch (err: any) {
      if (this.listElement) {
        this.listElement.innerHTML = `<tr><td colspan="5" class="text-danger">Error loading employees: ${err.message}</td></tr>`;
      }
    }
  }

  private render(employees: Employee[]): void {
    if (!this.listElement) return;
    this.listElement.innerHTML = "";

    employees.forEach((emp) => {
      const tr = document.createElement("tr");

      // ID
      const tdId = document.createElement("td");
      tdId.textContent = emp.PersonID ?? "";
      tr.appendChild(tdId);

      // FIRST NAME
      const tdFirst = document.createElement("td");
      tdFirst.textContent = emp.FirstName ?? "";
      tr.appendChild(tdFirst);

      // LAST NAME
      const tdLast = document.createElement("td");
      tdLast.textContent = emp.LastName ?? "";
      tr.appendChild(tdLast);

      // STATUS (pill badge)
      const tdStatus = document.createElement("td");
      const badge = document.createElement("span");
      const isActive = emp.Status === 1;
      badge.className = `badge rounded-pill ${
        isActive ? "bg-success" : "bg-danger"
      }`;
      badge.textContent = isActive ? "ACTIVE" : "INACTIVE";
      tdStatus.appendChild(badge);
      tr.appendChild(tdStatus);

      // ACTIONS (icon-only, right-aligned)
      const tdActions = document.createElement("td");
      tdActions.className = "text-end pe-3 text-nowrap";

      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "btn btn-link p-0 me-3 text-secondary";
      editBtn.innerHTML = `<i class="bi bi-pencil-square fs-5" aria-label="Edit"></i>`;
      editBtn.onclick = () => {
        location.hash = `form?id=${emp.PersonID}`;
      };

      const delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "btn btn-link p-0 text-secondary";
      delBtn.innerHTML = `<i class="bi bi-trash fs-5" aria-label="Delete"></i>`;
      delBtn.onclick = () => {
        location.hash = `delete?id=${emp.PersonID}`;
      };

      tdActions.append(editBtn, delBtn);
      tr.appendChild(tdActions);

      this.listElement!.appendChild(tr);
    });
  }
}
