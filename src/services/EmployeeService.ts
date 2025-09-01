import { Employee } from "../models/Employee.js";
import { AppConfig } from "../config/config.js";

const BASE_URL = AppConfig.api.baseUrl;

export class EmployeeService {
  private getHeaders(): HeadersInit {
    return {
      "Content-Type": "application/json",
      CustomerID: AppConfig.api.customerId,
      APIKey: AppConfig.api.apiKey,
    };
  }

  /**
   * Get all employees
   */
  async getAll(): Promise<Employee[]> {
    const res = await fetch(BASE_URL, {
      method: "GET",
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Failed to fetch employees: ${errText}`);
    }

    return res.json();
  }

  /**
   * Get a single employee by ID
   */
  async getById(id: string): Promise<Employee> {
    const url = `${BASE_URL}(${id})`;
    const res = await fetch(url, {
      method: "GET",
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Failed to fetch employee ${id}: ${errText}`);
    }

    return res.json();
  }

  /**
   * Create a new employee
   */
  async create(employee: Employee): Promise<Employee> {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(employee),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Failed to create employee: ${errText}`);
    }

    return res.json();
  }

  /**
   * Update an existing employee
   */
  async update(id: string, employee: Employee): Promise<Employee> {
    const url = `${BASE_URL}(${id})`;
    const res = await fetch(url, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(employee),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Failed to update employee ${id}: ${errText}`);
    }

    return res.json();
  }

  /**
   * Delete an employee by ID
   */
  async delete(id: string): Promise<void> {
    const url = `${BASE_URL}(${id})`;
    const res = await fetch(url, {
      method: "DELETE",
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Failed to delete employee ${id}: ${errText}`);
    }
  }
}
