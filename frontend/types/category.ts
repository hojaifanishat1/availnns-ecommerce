export interface Category {

  _id: string;

  name: string;

  slug: string;

  description?: string;

  image?: string;

  parent?: string | null;

  isActive?: boolean;

  createdAt?: string;

  updatedAt?: string;


  // category tree এর জন্য
  children?: Category[];

}

export interface CategoryOption {

  _id: string;

  name: string;

  slug: string;

  parent?: string | null;

}