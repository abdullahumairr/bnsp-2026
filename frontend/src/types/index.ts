export interface User {
  id: number;
  full_name: string;
  email: string;
  role: "user" | "admin";
}

export interface Book {
  id: number;
  title: string;
  author: string;
  price: number;
  discount_price: number | null;
  stock: number;
  description: string;
  technical_details: string;
  image_url: string;
  category_id: number;
  category_name?: string;
  is_editors_choice: number;
}

export interface CartItem extends Book {
  quantity: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}
