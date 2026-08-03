interface Props {

show:boolean;

}



export default function LoadingOverlay({

show

}:Props){


if(!show)

return null;



return (

<div

className="
fixed
inset-0
bg-black/40
flex
items-center
justify-center
z-50
"

>


<div

className="
bg-white
rounded-xl
px-6
py-4
font-medium
"

>

Loading...

</div>



</div>

);


}