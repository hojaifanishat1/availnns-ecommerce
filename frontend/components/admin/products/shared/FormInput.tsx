interface Props {

label:string;

value:string | number;

onChange:(

value:string

)=>void;


type?:string;

placeholder?:string;

error?:string;

}



export default function FormInput({

label,

value,

onChange,

type="text",

placeholder,

error

}:Props){


return (

<div
className="
space-y-1
"
>


<label
className="
text-sm
font-medium
"
>

{label}

</label>



<input

type={type}

value={value}

placeholder={placeholder}

onChange={(e)=>
onChange(
e.target.value
)
}

className="
w-full
border
rounded-lg
px-3
py-2
"
/>



{
error &&

<p
className="
text-sm
text-red-500
"
>

{error}

</p>

}



</div>

);


}