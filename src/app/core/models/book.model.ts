import { AuthorSummary } from "./author.model";
import { CategorySummary } from "./category.model";

export interface Book {
  bookId: number;
  title: string;
  description?: string;
  isbn?: string;
  author: AuthorSummary;
  category: CategorySummary;
  totalAmount: number;
  availableAmount: number;
  bookStatus: BookStatus;
  imageUrl?: string;
  registerDate: string;
  publicationYear?: number;
  activeReservations: number;
  isReservedByCurrentUser: boolean;
}

export interface BookSummary {
  bookId: number;
  title: string;
  imageUrl?: string;
  bookStatus: BookStatus;
  authorName: string;
}

export interface BookCreate {
  title: string;
  description?: string;
  isbn?: string;
  authorId: number;
  categoryId: number;
  totalAmount: number;
  availableAmount: number;
  publicationYear?: number;
}

export interface BookUpdate {
  title?: string;
  description?: string;
  isbn?: string;
  authorId?: number;
  categoryId?: number;
  totalAmount?: number;
  availableAmount?: number;
  publicationYear?: number;
}

export interface BookSearch {
  query?: string;
  categoryId?: number;
  authorId?: number;
  status?: BookStatus;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export enum BookStatus {
  AVAILABLE = 'AVAILABLE',
  LOW_STOCK = 'LOW_STOCK',
  UNAVAILABLE = 'UNAVAILABLE'
}