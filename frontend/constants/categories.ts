export interface CategoryOption {

  label:string;

  value:string;

  icon?:string;

}






// Default category icons mapping
// Actual categories আসবে admin API থেকে


export const CATEGORY_ICONS:Record<string,string> = {


fashion:"Shirt",


men:"User",


women:"UserRound",


kids:"Baby",


shoes:"Footprints",


bags:"Briefcase",


watches:"Watch",


electronics:"Smartphone",


laptop:"Laptop",


tablet:"Tablet",


accessories:"Package",


};








// fallback categories

export const PRODUCT_CATEGORIES:CategoryOption[]=[



{
label:"Fashion",
value:"fashion",
icon:CATEGORY_ICONS.fashion
},



{
label:"Electronics",
value:"electronics",
icon:CATEGORY_ICONS.electronics
},



{
label:"Accessories",
value:"accessories",
icon:CATEGORY_ICONS.accessories
},



];









export function getCategoryIcon(

slug:string

){



return CATEGORY_ICONS[slug] || "Package";


}







export default PRODUCT_CATEGORIES;