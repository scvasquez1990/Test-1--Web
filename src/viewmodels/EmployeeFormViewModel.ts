// src/viewmodels/EmployeeFormViewModel.ts
import { EmployeeService } from "../services/EmployeeService.js";
import { Employee } from "../models/Employee.js";

export class EmployeeFormViewModel {
  private service: EmployeeService;
  private formElement: HTMLFormElement | null;
  private breadcrumbElement: HTMLElement | null;

  // Cached inputs
  private firstNameInput!: HTMLInputElement;
  private lastNameInput!: HTMLInputElement;
  private personIdInput!: HTMLInputElement;
  private ssnInput!: HTMLInputElement;
  private activeInput!: HTMLInputElement;

  private generateGuid(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  private isValidGuid(value: string): boolean {
    if (!value) return true;
    const guidRegex =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    return guidRegex.test(value);
  }

  private generateEmployeeNo(): string {
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    const timestampPart = Date.now().toString().slice(-5); 
    return `EMP-${timestampPart}${randomPart}`;
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

    // Cache inputs
    this.firstNameInput =
      this.formElement.querySelector<HTMLInputElement>("[name=firstName]")!;
    this.lastNameInput =
      this.formElement.querySelector<HTMLInputElement>("[name=lastName]")!;
    this.personIdInput =
      this.formElement.querySelector<HTMLInputElement>("[name=personId]")!;
    this.ssnInput =
      this.formElement.querySelector<HTMLInputElement>("[name=ssn]")!;
    this.activeInput =
      this.formElement.querySelector<HTMLInputElement>("[name=active]")!;

    // Apply HTML5 constraints programmatically (in case markup wasn’t updated)
    this.firstNameInput.required = true;
    this.lastNameInput.required = true;
    this.ssnInput.maxLength = 10;
    this.ssnInput.required = true;

    // Live validation cleanup while typing
    [
      this.firstNameInput,
      this.lastNameInput,
      this.ssnInput,
      this.personIdInput,
    ].forEach((el) => {
      el.addEventListener("input", () => {
        el.setCustomValidity("");
        el.classList.remove("is-invalid");
        // Enforce maxlength manually too (for pasted values)
        if (el === this.ssnInput && this.ssnInput.value.length > 10) {
          this.ssnInput.value = this.ssnInput.value.slice(0, 10);
        }
        if (this.formElement!.classList.contains("was-validated")) {
          el.reportValidity();
        }
        // Keep breadcrumb fresh
        if (el === this.firstNameInput || el === this.lastNameInput) {
          this.updateBreadcrumb();
        }
      });
    });

    // If editing, load employee data
    const params = new URLSearchParams(location.hash.split("?")[1]);
    const id = params.get("id");


    if (id) {
      this.loadEmployee(id);
    } else {
      this.personIdInput.readOnly = false;
      this.updateBreadcrumb();
    }

    // Submit handler with validation
    this.formElement.addEventListener("submit", async (e) => {
      e.preventDefault();
      const isValid = this.validateForm();
      this.formElement!.classList.add("was-validated");

      if (!isValid) {
        return;
      }

      await this.saveEmployee(id);
    });
  }

  // ————— Validation —————

  private validateForm(): boolean {
    let valid = true;

    const first = (this.firstNameInput.value || "").trim();
    const last = (this.lastNameInput.value || "").trim();
    const ssn = (this.ssnInput.value || "").trim();
    const personId = (this.personIdInput.value || "").trim();
    // First Name required
    this.firstNameInput.setCustomValidity("");
    if (!first) {
      this.firstNameInput.setCustomValidity("First name is required.");
      this.firstNameInput.classList.add("is-invalid");
      valid = false;
    } else {
      this.firstNameInput.classList.remove("is-invalid");
    }

    // Last Name required
    this.lastNameInput.setCustomValidity("");
    if (!last) {
      this.lastNameInput.setCustomValidity("Last name is required.");
      this.lastNameInput.classList.add("is-invalid");
      valid = false;
    } else {
      this.lastNameInput.classList.remove("is-invalid");
    }

    // SSN required AND length <= 10
    this.ssnInput.setCustomValidity("");
    if (!ssn) {
      this.ssnInput.setCustomValidity("SSN is required.");
      this.ssnInput.classList.add("is-invalid");
      valid = false;
    } else if (ssn.length > 10) {
      this.ssnInput.setCustomValidity("SSN must be at most 10 characters.");
      this.ssnInput.classList.add("is-invalid");
      valid = false;
    } else {
      this.ssnInput.classList.remove("is-invalid");
    }

    // PersonID must be valid GUID if provided
    this.personIdInput.setCustomValidity("");
    if (!this.isValidGuid(personId)) {
      this.personIdInput.setCustomValidity(
        "Invalid GUID format (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)"
      );
      this.personIdInput.classList.add("is-invalid");
      valid = false;
    } else {
      this.ssnInput.classList.remove("is-invalid");
    }

    return valid;
  }

  // ————— UI helpers —————

  private updateBreadcrumb(): void {
    if (!this.breadcrumbElement) return;

    const first = (this.firstNameInput?.value || "").trim();
    const last = (this.lastNameInput?.value || "").trim();

    if (!first && !last) {
      this.breadcrumbElement.textContent = "";
    } else {
      this.breadcrumbElement.textContent = `${first} ${last}`.trim();
    }
  }

  // ————— Data load/save —————

  private async loadEmployee(id: string): Promise<void> {
    try {
      const emp: Employee = await this.service.getById(id);
      if (!this.formElement) return;

      this.ssnInput.value = emp.SSN ?? "";
      this.firstNameInput.value = emp.FirstName ?? "";
      this.lastNameInput.value = emp.LastName ?? "";
      this.personIdInput.value = emp.PersonID ?? "";
      this.activeInput.checked = emp.Status === 1;

      this.personIdInput.readOnly = true;

      this.updateBreadcrumb();
      this.formElement.classList.remove("was-validated");
    } catch (err: any) {
      console.error("Failed to load employee", err);
      alert("Could not load employee details.");
    }
  }

  private async saveEmployee(id: string | null): Promise<void> {
    if (!this.formElement) return;
    const nowIso = new Date().toISOString();

    // Ensure PersonID exists
    let personId = this.personIdInput.value.trim();
    if (!personId) {
      personId = this.generateGuid();
      this.personIdInput.value = personId;
    }

    // Trim values before save
    const employee: Employee = {
      PersonID: personId,
      SSN: this.ssnInput.value.trim(),
      FirstName: this.firstNameInput.value.trim(),
      LastName: this.lastNameInput.value.trim(),
      Status: this.activeInput.checked ? 1 : 0,

      LastUpdatedBy: "admin",
      LastUpdatedDate: nowIso,
      EmployeeNo: this.generateEmployeeNo(),
      EmploymentStartDate: nowIso,
      EmploymentEndDate: null,
    };

    try {
      if (id) {
        await this.service.update(id, employee);
      } else {
        await this.service.create(employee);
      }
      location.hash = "list"; // go back to list
    } catch (err: any) {
      console.error("Save failed", err);
      alert("Failed to save employee: " + (err?.message ?? String(err)));
    }
  }
}
