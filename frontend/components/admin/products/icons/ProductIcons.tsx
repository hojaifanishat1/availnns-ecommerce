import {
  Package,
  ShoppingBag,
  Tag,
  Layers,
  Image as ImageIcon,
  Truck,
  Boxes,
  Search,
  Settings,
  DollarSign,
  Warehouse,
  Star,
  ShieldCheck,
  LucideIcon,
} from "lucide-react";

export const ProductIcons: Record<string, LucideIcon> = {
  product: Package,
  shopping: ShoppingBag,
  tag: Tag,
  category: Layers,
  image: ImageIcon,
  shipping: Truck,
  inventory: Warehouse,
  stock: Boxes,
  seo: Search,
  settings: Settings,
  price: DollarSign,
  featured: Star,
  warranty: ShieldCheck,
};

export default ProductIcons;
