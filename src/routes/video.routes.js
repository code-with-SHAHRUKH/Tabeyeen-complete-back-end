import { Router } from "express";

import { AddVideo,VideosList,getsingleVideo,deleteSingleVideo,updateVideoDetails} from "../Controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { checkPrivilege } from "../middlewares/checkPrivilege.middleware.js";
const router = Router()

//this is secure--> for admin
//now i am uploading terminology
router.route("/addVideo").post(verifyJWT,checkPrivilege("Add Terms"),AddVideo)



// any person can get list
router.route("/videos-list").get(VideosList);
//any person can get single-video
router.route("/single-Video/:videoId").get(getsingleVideo);
//this is secure--> for admin
router.route("/delete-Video/:videoId").delete(verifyJWT,checkPrivilege("Delete Terms"),deleteSingleVideo)
//this is secure--> for admin
router.route("/update-Video/:videoId").patch(verifyJWT,checkPrivilege("Edit Terms"),upload.fields(
    //that can accept 2 different types of files
    [
    {
        name: "thumbnail",// front end me bhi name same rhe ga
        maxCount: 1// hum abhi sir 1 image le ge
    }, 
    {
        name: "videoFile",
        maxCount: 1
    }]
),updateVideoDetails)   


export default router