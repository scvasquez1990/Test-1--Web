// src/viewmodels/EmployeeDeleteViewModel.ts
import { EmployeeService } from "../services/EmployeeService.js";

export class EmployeeDeleteViewModel {
  private service: EmployeeService;

  constructor() {
    this.service = new EmployeeService();
  }

  init(): void {
    const params = new URLSearchParams(location.hash.split("?")[1]);
    const id = params.get("id");

    if (!id) {
      alert("No employee ID provided.");
      location.hash = "list";
      return;
    }

    const confirmBtn = document.getElementById("confirm-delete");
    if (confirmBtn) {
      confirmBtn.addEventListener("click", async () => {
        try {
          await this.service.delete(id);
          alert("Employee deleted successfully.");
          location.hash = "list";
        } catch (err: any) {
          console.error("Delete failed", err);
          alert("Failed to delete employee: " + err.message);
        }
      });
    }
  }
}
