import api from "@/services/api";



// =========================
// CREATE ORDER
// =========================

export const createOrder = async(
  data:any
)=>{


const res =
await api.post(
"/orders",
data
);


return res.data;


};






// =========================
// GET MY ORDERS
// =========================

export const getMyOrders = async()=>{


const res =
await api.get(
"/orders/my-orders"
);



return (
  res.data.orders ||
  []
);


};






// =========================
// GET SINGLE ORDER
// =========================

export const getOrderById = async(
  id:string
)=>{


const res =
await api.get(

`/orders/${id}`

);



return (
  res.data.order ||
  res.data
);


};







// =========================
// CANCEL ORDER
// =========================

export const cancelOrder = async(
 id:string
)=>{


const res =
await api.put(

`/orders/${id}/cancel`

);



return res.data;


};







// =========================
// GET ADMIN ORDERS
// =========================

export const getAdminOrders = async()=>{


const res =
await api.get(

"/admin/orders"

);



return (
 res.data.orders ||
 []
);


};







// =========================
// UPDATE ORDER STATUS (ADMIN)
// =========================

export const updateOrderStatus = async(

id:string,

status:string

)=>{


const res =
await api.put(

`/admin/orders/${id}/status`,

{

status

}

);



return res.data;


};







// =========================
// UPDATE PAYMENT STATUS
// =========================

export const updatePayment = async(

id:string,

paymentMethod:string,

paymentStatus:string

)=>{


const res =
await api.put(

`/admin/orders/${id}/payment`,

{

paymentMethod,

paymentStatus

}

);



return res.data;


};






// =========================
// DELETE ORDER (ADMIN)
// =========================

export const deleteOrder = async(
  id:string
)=>{


const res =
await api.delete(

`/admin/orders/${id}`

);



return res.data;


};
