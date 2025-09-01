# HR Management Application (MVVM • TypeScript • SPA)

A single-page HR app that lets users list, create, edit, and delete employees.

## Features

- MVVM architecture in plain TypeScript (no React/Angular)
- Hash-based router, 3 views (List, Form, Delete(Working as a modal))
- Bootstrap for responsive UI
- CRUD against Modularis HRDemo API (headers: `CustomerID`, `APIKey`)
- Configurable base URL and headers via `src/config/config.ts`

## Architecture (MVVM)

- **Models** (`src/models`): DTOs used by the UI & API ( Employee ).
- **ViewModels** (`src/viewmodels`): UI state + logic (List, Form, Delete).
- **Views** (`public/employee/*.html`): Pure HTML rendered by router.
- **Services** (`src/services`): API communication (`EmployeeService`).
- **Router** (`src/router.ts`): Loads view HTML + activates matching VM.

#Set up

# 1) Clone repository locally

git clone https://github.com/scvasquez1990/Test-1--Web.git

# 2) Install dependencies

npm install

# 3) Configure json key values inside the src/config/config.ts

baseUrl: "https://gateway.modularis.com/HRDemo/RESTActivityWebService/HRDemo.Example/Employees",
customerId: "<your CustomerID>",
apiKey: "<your APIKey>"

# 4) Build TypeScript

npm run build

# 5) Serve the app (public is the server root)

npx serve public

# open http://localhost:3000
