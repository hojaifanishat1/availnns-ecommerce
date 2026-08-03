import {
z
} from "zod";





export const productValidator = z.object({



name:

z.string()

.min(

3,

"Product name minimum 3 characters"

),





description:

z.string()

.min(

10,

"Description minimum 10 characters"

),






brand:

z.string()

.optional(),






sku:

z.string()

.optional(),






category:

z.string()

.min(

1,

"Category required"

),






pricing:

z.object({

price:

z.number()

.min(

0,

"Price required"

),


discountPrice:

z.number()

.optional()


}),






stock:

z.number()

.min(

0,

"Stock cannot be negative"

),






images:

z.array(

z.object({

url:z.string()

})

)

.min(

1,

"At least one image required"

)





});








export type ProductValidatorType =

z.infer<

typeof productValidator

>;