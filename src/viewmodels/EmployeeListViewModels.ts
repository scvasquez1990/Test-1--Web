// src/viewmodels/EmployeeListViewModel.ts
import { EmployeeService } from "../services/EmployeeService.js";
import { Employee } from "../models/Employee.js";

// Optional: normalize various Status shapes (number|boolean|string) into a boolean.
function isActiveStatus(status: unknown): boolean {
  if (typeof status === "boolean") return status;
  if (typeof status === "number") return status === 1;
  if (typeof status === "string") {
    const s = status.trim().toLowerCase();
    return s === "active" || s === "1" || s === "true";
  }
  return false;
}

export class EmployeeListViewModel {
  private service: EmployeeService;
  private listElement: HTMLElement | null;

  // Modal state
  private deleteModal: any | null = null; // Bootstrap.Modal instance
  private currentDeleteId: string | null = null;
  private currentRowEl: HTMLTableRowElement | null = null;

  constructor(listElementId: string) {
    this.service = new EmployeeService();
    this.listElement = document.getElementById(listElementId);

    // Grab the modal that lives in employee-list.html and wire it
    this.initDeleteModalFromDom();
  }

  async loadEmployees(): Promise<void> {
    try {
      const employees: Employee[] = await this.service.getAll();
      this.render(employees);
    } catch (err: any) {
      if (this.listElement) {
        const msg = err?.message ?? String(err);
        this.listElement.innerHTML = `<tr><td colspan="5" class="text-danger">Error loading employees: ${msg}</td></tr>`;
      }
    }
  }

  // ---------- Modal: use the one already in the DOM ----------

  private initDeleteModalFromDom(): void {
    const modalNode = document.getElementById("deleteModal");
    if (!modalNode) return;

    const Bootstrap: any = (window as any).bootstrap;
    if (!Bootstrap?.Modal) {
      console.warn("Bootstrap Modal not found. Include bootstrap.bundle.js");
      return;
    }

    this.deleteModal = new Bootstrap.Modal(modalNode);

    // Confirm button wiring (inside the modal)
    const confirmBtn = modalNode.querySelector(
      "#confirm-delete"
    ) as HTMLButtonElement | null;
    if (confirmBtn) {
      confirmBtn.addEventListener("click", async () => {
        if (!this.currentDeleteId) return;
        try {
          await this.service.delete(this.currentDeleteId);
          if (this.currentRowEl && this.currentRowEl.parentElement) {
            this.currentRowEl.parentElement.removeChild(this.currentRowEl);
          }
          this.deleteModal?.hide();
        } catch (e: any) {
          alert("Failed to delete employee: " + (e?.message ?? String(e)));
        } finally {
          this.currentDeleteId = null;
          this.currentRowEl = null;
        }
      });
    }
  }

  private openDeleteModal(
    empId: string,
    fullName: string,
    rowEl: HTMLTableRowElement
  ): void {
    this.currentDeleteId = empId;
    this.currentRowEl = rowEl;

    // Optional: fill placeholders if present
    const nameSpan = document.getElementById("delete-emp-name");
    const idSpan = document.getElementById("delete-emp-id");
    if (nameSpan) nameSpan.textContent = fullName || "";
    if (idSpan) idSpan.textContent = empId || "";

    this.deleteModal?.show();
  }

  // ---------- Rendering ----------

  private render(employees: Employee[]): void {
    if (!this.listElement) return;
    this.listElement.innerHTML = "";

    employees.forEach((emp) => {
      const tr = document.createElement("tr");

      // ID
      const tdId = document.createElement("td");
      tdId.textContent = String((emp as any).PersonID ?? "");
      tr.appendChild(tdId);

      // FIRST NAME
      const tdFirst = document.createElement("td");
      tdFirst.textContent = (emp as any).FirstName ?? "";
      tr.appendChild(tdFirst);

      // LAST NAME
      const tdLast = document.createElement("td");
      tdLast.textContent = (emp as any).LastName ?? "";
      tr.appendChild(tdLast);

      // STATUS (pill badge)
      const tdStatus = document.createElement("td");
      const badge = document.createElement("span");
      const isActive = isActiveStatus((emp as any).Status);
      badge.className = `badge rounded-pill ${
        isActive ? "bg-success" : "bg-danger"
      }`;
      badge.textContent = isActive ? "ACTIVE" : "INACTIVE";
      tdStatus.appendChild(badge);
      tr.appendChild(tdStatus);

      // ACTIONS (icon-only, right-aligned)
      const tdActions = document.createElement("td");
      tdActions.className = "text-end pe-3 text-nowrap";

      const id = String((emp as any).PersonID ?? "");
      const fullName = `${(emp as any).FirstName ?? ""} ${
        (emp as any).LastName ?? ""
      }`.trim();

      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "btn btn-link p-0 me-3 text-secondary";
      editBtn.innerHTML = `<i class="bi bi-pencil-square fs-5" aria-label="Edit"></i>`;
      editBtn.onclick = () => {
        location.hash = `form?id=${id}`;
      };

      const delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "btn btn-link p-0 text-secondary";
      delBtn.innerHTML = `<i class="bi bi-trash fs-5" aria-label="Delete"></i>`;
      delBtn.onclick = () => this.openDeleteModal(id, fullName || id, tr);

      tdActions.append(editBtn, delBtn);
      tr.appendChild(tdActions);

      this.listElement!.appendChild(tr);
    });
  }
}
