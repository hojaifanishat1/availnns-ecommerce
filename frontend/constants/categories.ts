export interface CategoryOption {
  label: string;
  value: string;
  icon?: string;
}

export const CATEGORY_ICONS: Record<string, string> = {
  fashion: "Shirt",
  men: "User",
  women: "UserRound",
  kids: "Baby",
  shoes: "Footprints",
  bags: "Briefcase",
  watches: "Watch",
  electronics: "Smartphone",
  laptop: "Laptop",
  tablet: "Tablet",
  accessories: "Package",
};

export const PRODUCT_CATEGORIES: CategoryOption[] = [];

export function getCategoryIcon(
  slug?: string
): string {
  if (!slug) {
    return CATEGORY_ICONS.accessories || "Package";
  }

  const normalizedSlug = slug.toLowerCase().trim();
  return CATEGORY_ICONS[normalizedSlug] || "Package";
}

/**
 * Fetches categories directly from the admin panel API.
 */
export async function fetchAdminCategories(): Promise<CategoryOption[]> {
  try {
    const response = await fetch("/api/admin/categories", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch admin categories: ${response.statusText}`);
    }

    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      return data.map((cat: any) => ({
        label: cat.label || cat.name || cat.title,
        value: cat.value || cat.slug || cat.id,
        icon: cat.icon || getCategoryIcon(cat.value || cat.slug || cat.name),
      }));
    }

    return [];
  } catch (error) {
    console.error("Error calling admin categories API:", error);
    return [];
  }
}

export default PRODUCT_CATEGORIES;
