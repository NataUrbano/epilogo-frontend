import { BookSummary } from './book.model';

export interface Category {
  categoryId: number;
  categoryName: string;
  description?: string;
  imageUrl?: string;
  books: BookSummary[];
  totalBooks: number;
}

export interface CategorySummary {
  categoryId: number;
  categoryName: string;
  imageUrl?: string;
}

export interface CategoryCreate {
  categoryName: string;
  description?: string;
}

export interface CategoryUpdate {
  categoryName?: string;
  description?: string;
}