export interface ProductShipping {


weight:{

value:number;

unit:"kg"|"g"|"lb";

};



dimensions:{


length:number;


width:number;


height:number;


};



freeShipping:boolean;



}