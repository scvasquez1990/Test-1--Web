// src/router.ts
import { EmployeeListViewModel } from "./viewmodels/EmployeeListViewModels.js";
import { EmployeeFormViewModel } from "./viewmodels/EmployeeFormViewModel.js";
import { EmployeeDeleteViewModel } from "./viewmodels/EmployeeDeleteViewModel.js";

export class Router {
  private routes: Record<string, string> = {};
  private defaultRoute: string;
  private root: HTMLElement;

  constructor(root: HTMLElement, defaultRoute: string) {
    this.root = root;
    this.defaultRoute = defaultRoute;
    window.addEventListener("hashchange", () => this.loadRoute());
  }

  register(path: string, htmlFile: string) {
    this.routes[path] = htmlFile;
  }

  async start() {
    if (!location.hash) {
      location.hash = this.defaultRoute;
    }
    await this.loadRoute();
  }

  private async loadRoute() {
    // remove query string (e.g. "#form?id=123")
    const [routeName] = location.hash.replace("#", "").split("?");
    const htmlFile = this.routes[routeName];

    if (htmlFile) {
      const response = await fetch(htmlFile);
      const html = await response.text();
      this.root.innerHTML = html;

      switch (routeName) {
        case "list":
          {
            const vm = new EmployeeListViewModel("employee-list");
            vm.loadEmployees();
          }
          break;

        case "form":
          {
            const vm = new EmployeeFormViewModel();
            vm.init();
          }
          break;

        case "delete":
          {
            const vm = new EmployeeDeleteViewModel();
            vm.init();
          }
          break;
      }
    } else {
      location.hash = this.defaultRoute;
    }
  }
}
