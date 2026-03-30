export type UserRole = "admin" | "manager" | "employee" | "client";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  boutique_id: string | null;
  created_at: string;
}

export interface Boutique {
  id: string;
  name: string;
  address?: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  category_id: string;
  min_stock_alert?: number;
  image_url?: string;
  created_at: string;
  category?: Category;
  stocks?: Stock[];
}

export interface Stock {
  id: string;
  product_id: string;
  boutique_id: string;
  quantity: number;
  boutique?: Boutique;
}

export type OrderSource =
  | "reseaux_sociaux"
  | "ami"
  | "publicite"
  | "passage_boutique"
  | "employe";

export type OrderStatus = "pending" | "completed" | "cancelled";

export interface Order {
  id: string;
  client_name: string;
  phone: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  source: OrderSource;
  referred_employee_name?: string;
  total: number;
  status: OrderStatus;
  employee_id?: string;
  boutique_id: string;
  is_scheduled?: boolean;
  scheduled_at?: string;
  created_at: string;
  order_items?: OrderItem[];
  boutique?: Boutique;
  employee?: User;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface EmployeeReferral {
  id: string;
  employee_id: string;
  client_name: string;
  order_id: string;
  created_at: string;
  employee?: User;
  order?: Order;
}

// Cart types (client-side only)
export interface CartItem {
  product: Product;
  quantity: number;
  boutique_id: string;
}

// Dashboard stats types
export interface SalesStat {
  boutique_id: string;
  boutique_name: string;
  total_revenue: number;
  total_orders: number;
}

export interface EmployeeStat {
  employee_id: string;
  employee_name: string;
  boutique_name: string;
  total_revenue: number;
  total_orders: number;
  referral_count: number;
}

export interface LowStockAlert {
  product_id: string;
  product_name: string;
  boutique_id: string;
  boutique_name: string;
  quantity: number;
}
