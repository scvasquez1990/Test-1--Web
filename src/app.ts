import { Router } from "./router.js";

window.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("app")!;
  const router = new Router(root, "list");

  // Register routes
  router.register("list", "employee/employee-list.html");
  router.register("form", "employee/employee-form.html");
  router.register("delete", "employee/employee-delete.html");

  router.start();
});
