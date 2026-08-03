import {

z

} from "zod";






export const mediaValidator = z.object({



url:

z.string()

.url(

"Invalid image URL"

),






publicId:

z.string()

.optional(),






alt:

z.string()

.optional(),






isPrimary:

z.boolean()

.optional()



});







export type MediaValidatorType =

z.infer<

typeof mediaValidator

>;