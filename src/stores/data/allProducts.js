import { mobileData } from "./mobiles";
import { computerData } from "./computers";
import { watchData } from "./watch";
import { menData } from "./men";
import { womanData } from "./woman";
import { furnitureData } from "./furniture";
import { kitchenData } from "./kitchen";
import { fridgeData } from "./fridge";
import { acData } from "./ac";
import { booksData } from "./books";
import { speakerData } from "./speaker";
import { tvData } from "./tv";

export const PRODUCT_SOURCES = [
  { type: "mobiles", label: "Mobiles", items: mobileData },
  { type: "computers", label: "Computers", items: computerData },
  { type: "watch", label: "Watches", items: watchData },
  { type: "men", label: "Fashion (Men)", items: menData },
  { type: "woman", label: "Fashion (Women)", items: womanData },
  { type: "furniture", label: "Furniture", items: furnitureData },
  { type: "kitchen", label: "Kitchen", items: kitchenData },
  { type: "fridge", label: "Fridge", items: fridgeData },
  { type: "ac", label: "AC", items: acData },
  { type: "books", label: "Books", items: booksData },
  { type: "speakers", label: "Speakers", items: speakerData },
  { type: "tv", label: "TV", items: tvData },
];

export function getAllProducts() {
  const base = PRODUCT_SOURCES.flatMap((source) =>
    (source.items || []).map((item) => ({
      ...item,
      image:
        typeof item?.image === "string" && item.image && !item.image.startsWith("/")
          ? `/${item.image}`
          : item.image,
      __sourceType: source.type,
      __sourceLabel: source.label,
    }))
  );

  let adminProducts = [];
  try {
    const raw = localStorage.getItem("ecommerce.adminProducts");
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) adminProducts = parsed;
  } catch {
    adminProducts = [];
  }

  return [...base, ...adminProducts];
}
