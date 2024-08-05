export interface Article {
  article_id?: number;
  author_id: number;
  title: string;
  text: string;
  date_created?: Date;
  attachments?: string[]; // Array of URLs as strings
  category: number;
}

export interface ArticleCategoryName {
  article_id?: number;
  author_id: number;
  title: string;
  text: string;
  date_created?: Date;
  attachments?: string[]; // Array of URLs as strings
  category: string;
}
