import { BookSummary } from './book.model';

export interface Author {
  authorId: number;
  authorName: string;
  biography?: string;
  birthYear?: number;
  deathYear?: number;
  imageUrl?: string;
  books: BookSummary[];
  totalBooks: number;
}

export interface AuthorSummary {
  authorId: number;
  authorName: string;
  imageUrl?: string;
}

export interface AuthorCreate {
  authorName: string;
  biography?: string;
  birthYear?: number;
  deathYear?: number;
}

export interface AuthorUpdate {
  authorName?: string;
  biography?: string;
  birthYear?: number;
  deathYear?: number;
}