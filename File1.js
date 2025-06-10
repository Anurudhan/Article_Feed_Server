export const f = async()=>{
    try {
        console.log("First execution =========================>1")
    } catch (error) {
        return error||"unknown error"
    }
}

export const f3 =async()=>{
    try {
        console.log("third execution =====================>3")
    } catch (error) {
        return error||"unkown error"
    }
}