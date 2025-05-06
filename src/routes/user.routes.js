import { Router } from "express";
import {registerUser,
        loginUser,
        logoutUser,
        refreshAccessToken,
        changeCurrentPassword,
        getCurrentUser,
        UsersList,
        getsingleUser,
        updateAccountDetails,
        updateUserAvatar,
        updateUserCoverImage,
        getUserChannelProfile,
        getWatchHistory
       } from "../Controllers/user.controller.js";

import {upload} from "../middlewares/multer.middleware.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router()

//router.route("/register").post( registerUser) //or jese hi user api/v1/user k baad /register per aae ga to registerUser will call
//now injecting middleware(upload) in above route to accept file
// router.route("/register").post(upload.fields(
//     //that can accept 2 different types of files
//     [{
    
//         name: "avatar",// front end me bhi name same rhe ga
//         maxCount: 1// hum abhi sir 1 image le ge
//     }, 
//     {
//         name: "coverImage",
//         maxCount: 1
//     }]
// ), registerUser)

//filhal file upload nhi ho rhi registration krte hue...
router.route("/register").post(registerUser)

router.route("/login").post(loginUser)


//    ---------------> Secured routes <---------------
router.route("/logout").post(verifyJWT,logoutUser)

router.route("/refresh-token").post(refreshAccessToken)// is me middle ware na de to bhi chale

router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
// this is also protected i will make it protected in fututre
router.route("/users-list").get(UsersList)
    
    router.route("/:bookId").get(getsingleUser)
    
   
router.route("/update-account").patch(verifyJWT, updateAccountDetails)

router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)

//    --------------> get data from backend <---------------
router.route("/c/:username").get(verifyJWT, getUserChannelProfile)//data url se backend me ja rha na k req.body se
router.route("/history").get(verifyJWT, getWatchHistory)
export default router