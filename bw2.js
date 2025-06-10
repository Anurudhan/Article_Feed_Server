// setTimeout((
//     setTimeout((
//         setTimeout(()=>{
//             return 10
//         },3000)
//     )=>{},2000)
// )=>{},1000)

import { f, f3 } from "./File1"
import { f2, f4 } from "./File2"

// const promise = new Promise

promise.then(f)
.then(f2)
.then(f3)
.then(f4)
.catch((err)=>{
    console.log(err)
})
.finally()


