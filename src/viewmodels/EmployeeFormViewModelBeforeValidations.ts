// src/viewmodels/EmployeeFormViewModel.ts
import { EmployeeService } from "../services/EmployeeService.js";
import { Employee } from "../models/Employee.js";

export class EmployeeFormViewModel {
  private service: EmployeeService;
  private formElement: HTMLFormElement | null;
  private breadcrumbElement: HTMLElement | null;

  private generateGuid(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  constructor() {
    this.service = new EmployeeService();
    this.formElement = document.getElementById(
      "employee-form"
    ) as HTMLFormElement;
    this.breadcrumbElement = document.getElementById(
      "breadcrumb-employee-name"
    );
  }

  init(): void {
    if (!this.formElement) return;

    // If editing, load employee data
    const params = new URLSearchParams(location.hash.split("?")[1]);
    const id = params.get("id");
    if (id) {
      this.loadEmployee(id);
    }

    // Hook up submit event
    this.formElement.addEventListener("submit", async (e) => {
      e.preventDefault();
      await this.saveEmployee(id);
    });

    // Hook up breadcrumb updates
    const firstNameInput = this.formElement.querySelector(
      "[name=firstName]"
    ) as HTMLInputElement;
    const lastNameInput = this.formElement.querySelector(
      "[name=lastName]"
    ) as HTMLInputElement;

    if (firstNameInput && lastNameInput && this.breadcrumbElement) {
      const updateBreadcrumb = () => {
        const first = firstNameInput.value || "New";
        const last = lastNameInput.value || "Employee";
        this.breadcrumbElement!.textContent = `${first} ${last}`;
      };

      // Update breadcrumb on typing
      firstNameInput.addEventListener("input", updateBreadcrumb);
      lastNameInput.addEventListener("input", updateBreadcrumb);

      // Set initial breadcrumb
      updateBreadcrumb();
    }
  }

  private async loadEmployee(id: string): Promise<void> {
    try {
      const emp: Employee = await this.service.getById(id);
      if (!this.formElement) return;

      (this.formElement.querySelector("[name=ssn]") as HTMLInputElement).value =
        emp.SSN ?? "";
      (
        this.formElement.querySelector("[name=firstName]") as HTMLInputElement
      ).value = emp.FirstName ?? "";
      (
        this.formElement.querySelector("[name=lastName]") as HTMLInputElement
      ).value = emp.LastName ?? "";
      (
        this.formElement.querySelector("[name=personId]") as HTMLInputElement
      ).value = emp.PersonID ?? "";
      (
        this.formElement.querySelector("[name=active]") as HTMLInputElement
      ).checked = emp.Status === 1;

      // Update breadcrumb after loading employee
      if (this.breadcrumbElement) {
        this.breadcrumbElement.textContent = `${emp.FirstName ?? ""} ${
          emp.LastName ?? ""
        }`;
      }
    } catch (err: any) {
      console.error("Failed to load employee", err);
      alert("Could not load employee details.");
    }
  }

  private async saveEmployee(id: string | null): Promise<void> {
    if (!this.formElement) return;
    const nowIso = new Date().toISOString();

    let personId = (
      this.formElement.querySelector("[name=personId]") as HTMLInputElement
    ).value;
    if (!personId) {
      personId = this.generateGuid(); //
      (
        this.formElement.querySelector("[name=personId]") as HTMLInputElement
      ).value = personId;
    }

    const employee: Employee = {
      PersonID: personId,
      SSN: (this.formElement.querySelector("[name=ssn]") as HTMLInputElement)
        .value,
      FirstName: (
        this.formElement.querySelector("[name=firstName]") as HTMLInputElement
      ).value,
      LastName: (
        this.formElement.querySelector("[name=lastName]") as HTMLInputElement
      ).value,
      Status: (
        this.formElement.querySelector("[name=active]") as HTMLInputElement
      ).checked
        ? 1
        : 0,

      LastUpdatedBy: "admin",
      LastUpdatedDate: nowIso,
      EmployeeNo: "00002",
      EmploymentStartDate: nowIso,
      EmploymentEndDate: null,
    };

    try {
      if (id) {
        await this.service.update(id, employee);
        //alert("Employee updated successfully.");
      } else {
        await this.service.create(employee);
        //alert("Employee created successfully.");
      }
      location.hash = "list"; // go back to list
    } catch (err: any) {
      console.error("Save failed", err);
      alert("Failed to save employee: " + err.message);
    }
  }
}
