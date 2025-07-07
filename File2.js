

// // gttteuuueeeeeettteee
// // output should be eeeeee



// // let a = "gttteuuueeeeeettteee";

// // let value="";

// // for(let i=0;i<a.length;i++){
// //     if(a[i]==a[i+1]){
// //         let res=a[i];
// //         for(let j=i+1;j<a.length;j++){
// //             if(a[i]==a[j]){
// //                 res+=a[j]
// //             }else break
// //         }
// //         if(res.length>value.length) value=res
// //     }
// // }
// // console.log(value)


// // const arr = [
// //   { "name": "Alice", "age": 20 },
// //   { "name": "Bob", "age": 22 },
// //   { "name": "Charlie", "age": 19 },
// //   { "name": "Diana", "age": 21 }
// // ];


// // function quickSort(arr){
// //     let pivot = Math.floor(arr.length/2)
// //     const leftarr=[];
// //     const rightarr=[];
// //     for(let i=0;i<arr.length;i++){
// //         if(arr[pivot].age>arr[i].age){
// //             leftarr.push(arr[i])
// //         }
// //         else if(arr[pivot].age<arr[i].age){
// //             rightarr.push(arr[i])
// //         }
// //     }
// //     return [...quickSort(leftarr),arr[pivot],...quickSort(rightarr)]
// // }

// // console.log(quickSort(arr))


// function findRepeatingSequence(value){
//     if(value.length==="") return "";

//     let maxSeq=value[0];
//     let curSeq=value[0];

//     for(let i=1;i<value.length;i++){
//         if(value[i] === value[i-1]){
//             curSeq+=value[i]
//         }
//         else{
//             if(curSeq.length>maxSeq.length) maxSeq=curSeq
//             curSeq=value[i]
//         }
//     }
//     if(curSeq.length>maxSeq.length) maxSeq=curSeq
//     return maxSeq
// }

// console.log(findRepeatingSequence(""))



const express = require('express');


const app= express();


app.use("/",router)



const router=()=>{
    const Route=express.Router();

    Route.post("/login",MiddleWare,login)
}

const MiddleWare=async(req,res,next)=>{
    try {
        console.log(req.method);
        next()
    } catch (error) {
        console.log(error)
    }
}
const login=async(req,res)=>{
    try {
        res.status(200)
    } catch (error) {
        res.status(500)
    }
}

app