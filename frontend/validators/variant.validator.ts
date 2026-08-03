import {

z

} from "zod";







export const variantValidator = z.object({



sku:

z.string()

.min(

1,

"SKU required"

),






size:

z.string()

.optional(),






color:

z.string()

.optional(),






stock:

z.number()

.min(

0,

"Invalid stock"

),






price:

z.number()

.min(

0,

"Invalid price"

)



});







export type VariantValidatorType =

z.infer<

typeof variantValidator

>;