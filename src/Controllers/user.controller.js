import { AsyncHandler } from "../utils/AsyncHandler.js";
// import { oauth2Client } from "../utils/GoogleConfig.js";
// import axios from "axios";
// import {sendEmail} from "../utils/SendEmail.js";
// import crypto from 'crypto';
import { ApiError } from "../utils/APIErrorStandarize.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary,deleteFromCloudinary} from "../utils/Cloudinary.js"
import { ApiResponse } from "../utils/APIRespStandarize.js";


const generateAccessAndRefereshTokens = async(userId) =>{
    // mongoose k bydefaul  methods ko hum User se acces kare ge
    // jo method hum ne khud se Schema me add kiye he Unhe hum user se access kare ge
    try {
        const user = await User.findById(userId)//--> ye mongoose ka method he // db  me se user laae ge
        const accessToken = user.generateAccessToken()// ye hum ne khud se inject kiya he
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken//user data me refersh token bhej do
        //user me nahi cheez add krne k baad use save karo
        await user.save({ validateBeforeSave: false })// save krne se pehle db p/w maange ga but is object ki waja se nhi maange ga

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}


// this is old logic to generateUser
const registerUser = AsyncHandler( 
    async (req,res,next,error) =>
     {
        /*Registeration steps*/
   // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return response
    // fullName, username, email, password
    const {fullName, username, role  } = req.body
    console.log("data from frontend :", fullName, role,req.body );

    if (
        [fullName, username, role ].some((field) => field?.trim() === "")
    ) {
        console.log("hello i m issue");
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({ username })

    console.log("User present:",existedUser);
    if (existedUser) {
        throw new ApiError(409, "User with username already exists")
    }

    // hamara User model directly Database k saath connected he
    
    const user = await User.create({
        fullName,
        // avatar: avatar.url,
        // coverImage: coverImage?.url || "",
        email:username, 
        password:"",
        role, 
        username
    })

console.log("Created user in Db:",user);
    const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

    const createdUser = await User.findById(user._id).select(
        // agr user Db me created he to is me se ye ye cheeze hata do or Client ko do
        "-refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }
    const options = {
        // in options k through hum kookies ko sirf server se modifyable bna de ge
        //nhi to koi bhi fronend se inhe modify kr skta
        httpOnly: true,
        secure: true
    }

    //res.status ko hi zyada tr server accept--> res.json k ander status bhi theek hi he

 return res.status(201).json(
    new ApiResponse(201, { user: createdUser }, "Sub-admin created successfully")
);

     }
 )


// this is new logic is me new user ko mail jay gi


// const registerUser = AsyncHandler(async (req, res) => {
//   const { fullName, email, username, role } = req.body;

//   if ([fullName, email, username, role].some((field) => field?.trim() === "")) {
//     throw new ApiError(400, "All fields are required");
//   }

//   const existedUser = await User.findOne({
//     $or: [{ username }, { email }],
//   });

//   if (existedUser) {
//     throw new ApiError(409, "User with email or username already exists");
//   }

//   // Generate a random password (e.g., 12 characters)
//   const plainPassword = crypto.randomBytes(6).toString('hex');

//   // Create user (password will be auto-hashed by the pre-save hook)
//   const user = await User.create({
//     fullName,
//     email,
//     username: username.toLowerCase(),
//     role,
//     password: plainPassword, // plain password; schema will hash it
//     isFirstLogin: true,      // optional: use this to force password reset on first login
//   });

//   const createdUser = await User.findById(user._id).select("-password -refreshToken");

//   if (!createdUser) {
//     throw new ApiError(500, "Something went wrong while registering the user");
//   }

//   // Send email with credentials
//   await sendEmail({
//     to: email,
//     subject: 'Your Admin Account Credentials',
//     html: `
//       <p>Dear ${fullName},</p>
//       <p>Your admin account has been created successfully.</p>
//       <p><strong>Email:</strong> ${email}</p>
//       <p><strong>Password:</strong> ${plainPassword}</p>
//       <p>Please log in and change your password immediately.</p>
//     `,
//   });

//   return res.status(201).json(
//     new ApiResponse(201, { user: createdUser }, "Admin registered and credentials sent via email")
//   );
// });



 const loginUser = AsyncHandler(async (req,res)=>{
    console.log("object req",req.header);
    //---> Steps of Login <---
    // req body -> data
    // username or email
    //find the user--> in DB
    //password check
    //access and referesh token--Generation
    //send cookie
    //send responce
    const { username, password} = req.body
    console.log("Data from front end",username,req.body);

    // if (!username && !email) {
    //     throw new ApiError(400, "username or email is required")
    // }
    
    // Here is an alternative of above code based on logic discussed in video:
    if (!(username)) {
        throw new ApiError(400, "username is required")
        
    }

  const user = await User.findOne({ username });
console.log("data in db:",user);
    if (!user) {
        throw new ApiError(404, "User does not exist please Register your self")
    }


    // Mongoose k methos User model me he--> ye by default present hote
    //or User model ne jo user bnaya he us k methods user obj me he--> ye hum ne khud se inject kiye he
    //
   const isPasswordValid = await user.isPasswordCorrect(password)//return t/f

   if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
    }

   const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

// ab updated user ko db se fetch kare ge--> because tokens ab save hue he--> ab user k paas refresh token he
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
// frontend/browser per kooklies send krne k lea hume options desighn krne perte...
    const options = {
        // in options k through hum kookies ko sirf server se modifyable bna de ge
        //nhi to koi bhi fronend se inhe modify kr skta
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        // mobile kookies accept nhi krta use responce hi samagh aae ga
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )

})


 const googleAuth = async (req, res, next) => {
    // const {email} = req.body;

    const { email } = req.body
    console.log("Data from front end",email);

    // if (!username && !email) {
    //     throw new ApiError(400, "username or email is required")
    // }
    
    // Here is an alternative of above code based on logic discussed in video:
    if (!(email)) {
        throw new ApiError(400, "username is required")
        
    }

  const user = await User.findOne({ email });
console.log("data in db:",user);
    if (!user) {
        throw new ApiError(404, "User does not exist please Register your self")
    }



   const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

// ab updated user ko db se fetch kare ge--> because tokens ab save hue he--> ab user k paas refresh token he
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
// frontend/browser per kooklies send krne k lea hume options desighn krne perte...
    const options = {
        // in options k through hum kookies ko sirf server se modifyable bna de ge
        //nhi to koi bhi fronend se inhe modify kr skta
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        // mobile kookies accept nhi krta use responce hi samagh aae ga
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )
};


const logoutUser = AsyncHandler(async(req, res) => {

    // user ko db se find karo or refresh token nikaal do
    await User.findByIdAndUpdate(
        //req.user hum middleware ki waja se le pa rahe...
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true  // is se hume update hone k baad ki info return hoti he
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)// acces token clear means user logged Out
    .clearCookie("refreshToken", options)// refresh token clear means user k lea Acces token ab nhi generate ho ga
    .json(new ApiResponse(200, {}, "User logged Out"))
})

/*when the access token will expire then this controller will call from frontend to generate new Acces-Token*/
// this is also used fro AutoLogin the User
const refreshAccessToken = AsyncHandler(async (req, res) => {
    //token from user
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})


const changeCurrentPassword = AsyncHandler(async(req, res) => {
    const {oldPassword, newPassword} = req.body

    

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")// inuted p/w not matched with Db p/w
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})



// here i learn how to connect 1 document/model with other document
const getCurrentUser = AsyncHandler(async(req, res) =>
     {
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        req.user,
        "User fetched successfully"
    ))
}

)


// how to get all users:

const UsersList = AsyncHandler(async(req, res) =>
    {
        const users = await User.find().select('-password');
   return res
   .status(200)
   .json(new ApiResponse(
       200,
       users,
       "Users fetched successfully"
   ))
}

)


// how to get single user:

const getsingleUser = AsyncHandler(async(req, res) =>
    {
        const userId = req.params.bookId
        const Singleuser = await User.findOne({ _id:userId })
   return res
   .status(200)
   .json(new ApiResponse(
       200,
       Singleuser,
       "Users fetched successfully"
   ))
}

)





const updateAccountDetails = AsyncHandler(async(req, res) => {
    const {fullName, email} = req.body

    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email: email
            }
        },
        {new: true}// update hone k baad return karo nhi to updated user ko lene k lea nai Db Call krni pare gi
        
    ).select("-password")// pasword k ilava sab kuch select kr k user variable me daal do

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))
});

const updateUserAvatar = AsyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing");
    }

    // Get user details
    const user = await User.findById(req.user?._id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Upload new avatar & delete old avatar in parallel

    const [avatar, oldAvatarDeleted] = await Promise.all([
        uploadOnCloudinary(avatarLocalPath),
        user.avatar ? deleteFromCloudinary(user.avatar) : Promise.resolve(null)
    ]);
  

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading avatar");
    }

    // Update user avatar in database
    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: { avatar: avatar.url } },
        { new: true }
    ).select("-password");

    return res.status(200).json(
        new ApiResponse(200, updatedUser, "Avatar image updated successfully")
    );
});


const updateUserCoverImage = AsyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image file is missing");
    }

    // Get user details
    const user = await User.findById(req.user?._id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Upload new cover image & delete old cover image in parallel
    const [coverImage, oldCoverDeleted] = await Promise.all([
        uploadOnCloudinary(coverImageLocalPath),
        user.coverImage ? deleteFromCloudinary(user.coverImage) : Promise.resolve(null)
    ]);

    if (!coverImage?.url) {
        throw new ApiError(400, "Error while uploading cover image");
    }

    // Update user cover image in database
    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: { coverImage: coverImage.url } },
        { new: true }
    ).select("-password");

    return res.status(200).json(
        new ApiResponse(200, updatedUser, "Cover image updated successfully")
    );
});



const getUserChannelProfile = AsyncHandler(async(req, res) => {
    const {username} = req.params// url se user ka name lo

    if (!username?.trim()) {
        throw new ApiError(400, "username is missing")
    }


    // ye aggregate khud he Db se user ko search kre ga $match---> Find method lagane ki zaroorat nahi
    const channel = await User.aggregate([
        {
            // ye pipeline parameter se ane wale user ko Db k documents se match krta/serach krta
            $match: {
                username: username?.toLowerCase()
            }
        },



             // Channel k subscribers found krne/ Channel ko Subscriber document se Joining
        {
            $lookup: {
                from: "subscriptions",// Subscription model se subscribers lo
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"// kitne subscribers he
            }//--> ye user Document ko array of objts return krta he jis ka name 'subscribers' ho ga
        },
        {
            $lookup: {
                from: "subscriptions",// Subscription model se subscribe to lo
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"// kin kin channels ko user ne subscribe kiya hua he
            }
        },
        {

            // user document me ye sab fields add kar do
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                // jis channel ki detal mughe mili he use me ne subscribe kiya hua he k nhi
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},// subscriber document me me hu k nhi
                        then: true,
                        else: false
                    }
                }
                //better of above
                // isSubscribed: {
                //     $cond: {
                //         if: { $ne: ["$username", req.user?.username] }, // Check if the logged-in user is viewing another user's channel
                //         then: {
                //             $in: [req.user?._id, "$subscribers.subscriber"] // Check if the logged-in user has subscribed to this channel
                //         },
                //         else: "$$REMOVE" // Remove field for the user's own channel
                //     }
                // }

            }
        },


        // this pipe line is used to send selected things in frontend
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1

            }
        }
    ])

    if (!channel?.length) {
        throw new ApiError(404, "channel does not exists")
    }
console.log("Channel details from Db:",channel);
    // channel se hume array of object mele ga hume just 1st object dena user ko
    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "User channel fetched successfully")
    )
})



const getWatchHistory = AsyncHandler(async(req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "Users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }

                    },
                    {
                        $addFields:{
                            owner:{
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "Watch history fetched successfully"
        )
    )
})



 export {
    registerUser,
    loginUser,
    googleAuth,
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
};