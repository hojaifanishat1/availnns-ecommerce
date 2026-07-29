"use client";

import {
  useEffect,
  useState
} from "react";

import Image from "next/image";

import Link from "next/link";

import { 
  Package,
  RotateCcw,
  Wallet,
  Heart,
  MapPin,
  ShieldCheck,
  QrCode,
  ChevronRight,
  User as UserIcon,
  Loader2,
  AlertCircle,
  RefreshCw,
  Globe,
  Bell,
  LogOut,
} from "lucide-react";


import {
  getUserDashboard
} from "@/services/user.service";


import {
  useAuth
} from "@/context/AuthContext";

import {
  useCurrency
} from "@/context/CurrencyContext";



interface UserData {

  name?:string;

  email?:string;

  avatar?:string;

}



interface DashboardStats {

  totalOrders?:number;

  pendingOrders?:number;

  deliveredOrders?:number;

  totalSpent?:number;

  activeReturns?:number;

  credits?:number;

  wishlistCount?:number;

}



interface DashboardResponse {

  user?:UserData;

  orders?:any[];

  stats?:DashboardStats;

}






export default function DashboardPage(){


const {
  logout
}=useAuth();

const {
  formatPrice
}=useCurrency();



const [data,setData]
=
useState<DashboardResponse|null>(null);



const [loading,setLoading]
=
useState(true);



const [error,setError]
=
useState<string|null>(null);





useEffect(()=>{

loadDashboard();

},[]);





const loadDashboard =
async()=>{


try{


setLoading(true);

setError(null);



const result =
await getUserDashboard();



setData(result);



}

catch(err:any){


console.log(
"Dashboard Error:",
err?.response?.data || err.message
);



setError(
"Failed to load dashboard data. Please try again."
);



}

finally{


setLoading(false);


}


};





const handleLogout = ()=>{


const confirmLogout =
confirm(
"Are you sure you want to log out?"
);



if(!confirmLogout)
return;



logout();


};

if(loading){

return (

<div
className="
min-h-[400px]
flex
flex-col
items-center
justify-center
gap-3
"
>

<Loader2
className="
animate-spin
text-slate-900
"
size={28}
/>


<p
className="
text-xs
font-medium
text-slate-500
tracking-wide
uppercase
"
>

Loading Dashboard...

</p>


</div>

);

}





if(error || !data){


return (

<div
className="
min-h-[300px]
flex
items-center
justify-center
p-4
"
>


<div
className="
bg-white
border
border-slate-200
rounded-2xl
p-6
text-center
space-y-3
shadow-xl
max-w-sm
w-full
"
>


<AlertCircle
size={32}
className="
mx-auto
text-rose-500
"
/>



<p
className="
text-xs
font-semibold
text-slate-700
"
>

{error}

</p>



<button

onClick={loadDashboard}

className="
inline-flex
items-center
gap-2
bg-slate-900
text-white
px-4
py-2
rounded-xl
text-xs
font-medium
"

>

<RefreshCw size={14}/>

Retry Loading

</button>



</div>


</div>


);


}





const {
user,
stats
}=data;





const accountLinks = [


{
label:"Addresses",
href:"/dashboard/address",
icon:MapPin
},


{
label:"Security",
href:"/dashboard/security",
icon:ShieldCheck
},


{
label:"Country",
href:"/dashboard/country",
icon:Globe
},


{
label:"Notification",
href:"/dashboard/notifications",
icon:Bell
},


{
label:"QR Code",
href:"/dashboard/qr-code",
icon:QrCode
},


];





return (

<div
className="
max-w-2xl
mx-auto
space-y-4
font-sans
pb-8
"
>




{/* PROFILE */}


<div
className="
bg-white
rounded-2xl
p-4
sm:p-5
border
shadow-sm
flex
items-center
justify-between
"
>


<div
className="
flex
items-center
gap-4
"
>


<div
className="
relative
w-14
h-14
rounded-2xl
bg-slate-900
flex
items-center
justify-center
overflow-hidden
"
>


{
user?.avatar ?


<Image

src={user.avatar}

alt="profile"

fill

unoptimized

className="
object-cover
"
/>


:


<UserIcon
size={24}
className="
text-white
"
/>


}


</div>





<div>


<div
className="
flex
items-center
gap-2
"
>


<h2
className="
text-lg
font-bold
"
>

{
user?.name || "Customer"
}

</h2>



<span
className="
bg-emerald-50
text-emerald-700
text-[10px]
px-2
py-1
rounded-full
"
>

Member

</span>


</div>





<p
className="
text-xs
text-slate-500
"
>

{
user?.email || "user@email.com"
}

</p>



</div>


</div>





<Link

href="/dashboard/profile"

className="
text-xs
font-semibold
bg-slate-50
border
px-4
py-2
rounded-xl
"

>

Edit Profile

</Link>



</div>





{/* STATS */}


<div
className="
grid
grid-cols-2
gap-3
"
>



<Link

href="/dashboard/orders"

className="
bg-white
p-4
rounded-2xl
border
shadow-sm
"

>


<div
className="
flex
justify-between
"
>


<span
className="
text-xs
font-semibold
text-slate-500
"
>

Orders

</span>


<Package size={18}/>


</div>



<p
className="
text-lg
font-bold
mt-5
"
>

{
stats?.totalOrders || 0
}

</p>


<p
className="
text-[11px]
text-slate-400
"
>

Total Orders

</p>


</Link>





<div
className="
bg-white
p-4
rounded-2xl
border
shadow-sm
"
>


<div
className="
flex
justify-between
"
>


<span
className="
text-xs
font-semibold
text-slate-500
"
>

Returns

</span>


<RotateCcw size={18}/>


</div>



<p
className="
text-lg
font-bold
mt-5
"
>

{
stats?.activeReturns || 0
}

</p>


<p
className="
text-[11px]
text-slate-400
"
>

Active Requests

</p>



</div>

{/* TOTAL SPENT */}

<div
className="
bg-white
p-4
rounded-2xl
border
shadow-sm
"
>


<div
className="
flex
justify-between
"
>


<span
className="
text-xs
font-semibold
text-slate-500
"
>

Total Spent

</span>



<Wallet size={18}/>


</div>



<p
className="
text-lg
font-bold
mt-5
"
>

{
formatPrice(
stats?.credits ??
stats?.totalSpent ??
0
)
}

</p>



<p
className="
text-[11px]
text-slate-400
"
>

Lifetime Spend

</p>



</div>





{/* WISHLIST */}


<Link

href="/wishlist"

className="
bg-white
p-4
rounded-2xl
border
shadow-sm
"

>


<div
className="
flex
justify-between
"
>


<span
className="
text-xs
font-semibold
text-slate-500
"
>

Wishlist

</span>



<Heart
size={18}
className="
text-red-500
"
/>



</div>



<p
className="
text-lg
font-bold
mt-5
"
>

{
stats?.wishlistCount || 0
}

</p>



<p
className="
text-[11px]
text-slate-400
"
>

Saved Items

</p>



</Link>



</div>








{/* ACCOUNT SETTINGS */}


<div
className="
space-y-2
pt-3
"
>


<h3
className="
text-xs
font-bold
uppercase
text-slate-400
px-1
"
>

Account Settings

</h3>





<div
className="
bg-white
rounded-2xl
border
overflow-hidden
divide-y
"
>


{
accountLinks.map(
(item,index)=>{


const Icon =
item.icon;



return (

<Link

key={index}

href={item.href}

className="
p-4
flex
items-center
justify-between
hover:bg-slate-50
transition
"

>


<div
className="
flex
items-center
gap-3
"
>


<div
className="
p-2
bg-slate-100
rounded-xl
"
>


<Icon
size={16}
/>


</div>




<span
className="
text-sm
font-semibold
"
>

{item.label}

</span>



</div>




<ChevronRight
size={16}
className="
text-slate-400
"
/>



</Link>


);


}

)

}





{/* LOGOUT */}


<button

onClick={handleLogout}

className="
w-full
p-4
flex
items-center
justify-between
hover:bg-red-50
transition
text-left
"

>


<div
className="
flex
items-center
gap-3
"
>


<div
className="
p-2
bg-red-50
text-red-600
rounded-xl
"
>


<LogOut
size={16}
/>


</div>




<span
className="
text-sm
font-semibold
text-red-600
"
>

Log Out

</span>



</div>



<ChevronRight
size={16}
className="
text-red-400
"
/>



</button>





</div>



</div>



</div>



);

}
