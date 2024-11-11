export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  inventoryCount: number;
  maxAllowedPerCustomer: number;
  orderQuantity?: number; // Optional attribute
}
