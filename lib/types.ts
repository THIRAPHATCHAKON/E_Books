export type Book = {
  id: string;
  title: string;
  description: string;
  price: number;
  cover_url: string | null;
  file_path: string | null;
  created_at: string;
};

export type OrderStatus = "PENDING" | "PAID";

export type Order = {
  id: string;
  order_number: string;
  book_id: string;
  customer_name: string;
  customer_email: string;
  status: OrderStatus;
  created_at: string;
  paid_at: string | null;
};