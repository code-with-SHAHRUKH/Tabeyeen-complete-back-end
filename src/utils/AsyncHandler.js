
// we apply promissfy Async handler in our project
const AsyncHandler = (funct) => {
    return (req, res, next) => {
        Promise.resolve(funct(req, res, next))
            .catch((error) => {
                res.status(error.code || 500).json({
                    success: false,
                    message: error.message || 'An error occurred',
                });
            });
    };
};
export {AsyncHandler};


// thsi is Async method to create Async handler
/*
const AsyncHandler=(funct)=>{

    return async(req,res,next)=>{
try {
    await funct(req,res,next);
} 
catch (error) {
    res.status(error.code||500).json({
        success:false,
        message:error.message,
    })
}
}
}
*/


//optimization of above removed curly braces and return---> hitesh sir also write this
/*const AsyncHandler = (funct) => async (req, res, next) => {
    try {
        await funct(req, res, next);
    } catch (error) {
        res.status(error.code || 500).json({
            success: false,
            message: error.message || 'An error occurred',
        });
    }
};

*/

