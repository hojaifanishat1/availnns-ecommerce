"use client";


import {

LineChart,

Line,

XAxis,

YAxis,

Tooltip,

CartesianGrid,

ResponsiveContainer,

} from "recharts";




interface Props {


data:{

date:string;

stock:number;

}[];


}




export default function StockChart({

data=[]

}:Props){



return (

<div

className="
border
rounded-xl
p-5
bg-white
"

>



<h3

className="
font-semibold
mb-4
"

>

Stock History

</h3>






<div

className="
h-72
"

>


<ResponsiveContainer

width="100%"

height="100%"

>



<LineChart

data={data}

>


<CartesianGrid />



<XAxis

dataKey="date"

/>



<YAxis />



<Tooltip />



<Line

type="monotone"

dataKey="stock"

/>



</LineChart>



</ResponsiveContainer>



</div>





</div>


);


}