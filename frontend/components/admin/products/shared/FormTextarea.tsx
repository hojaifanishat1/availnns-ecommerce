interface Props {

label:string;

value:string;

onChange:(

value:string

)=>void;


placeholder?:string;

}



export default function FormTextarea({

label,

value,

onChange,

placeholder

}:Props){


return (

<div
className="space-y-1"
>


<label
className="
text-sm
font-medium
"
>

{label}

</label>



<textarea

value={value}

placeholder={placeholder}

onChange={(e)=>

onChange(
e.target.value
)

}

rows={5}

className="
w-full
border
rounded-lg
p-3
"

/>



</div>

);


}