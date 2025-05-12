import { AsyncHandler } from "../utils/AsyncHandler.js";
import mongoose from "mongoose";
import { ApiError } from "../utils/APIErrorStandarize.js"
import { Video } from "../models/video.model.js";
import { QuranReference } from "../models/quran.model.js";
import {uploadOnCloudinary,deleteFromCloudinary} from "../utils/Cloudinary.js"
import { ApiResponse } from "../utils/APIRespStandarize.js";




const AddVideo = AsyncHandler( 
//     async (req,res,next,error) =>
//      {
//         /*Add Video steps*/
//    // get Video details from frontend
//     // validation - not empty
//     // check if Video already exists: username, email
//     // check for Thumbnail, check for video File
//     // upload them to cloudinary, Thumbnail and video File
//     // create Video object - create entry in db
//     // check for is video added successfully
//     // return response
    
//     const {title, description} = req.body
//     const userId = req.user?._id; //Assuming user is logged in & available in req.user

//     // console.log("email: ", email);

//     if (
//         [title, description].some((field) => field?.trim() === "")
//     ) {
//         throw new ApiError(400, "All fields are required")
//     }

//     const videoExist = await Video.findOne({
//         $or: [{ title }, { description }]
//     })

//     console.log("User present:",videoExist);
//     if (videoExist) {
//         throw new ApiError(409, "Video already exists")
//     }
//     //console.log(req.files);

//     const ThumbnailLocalPath = req.files?.thumbnail[0]?.path;// middleware hume request k saath extra cheez file de rha he
//     //const coverImageLocalPath = req.files?.coverImage[0]?.path;
// // console.log(avatarLocalPath);
//     let videoFileLocalPath;
//     if (req.files && Array.isArray(req.files.videoFile) && req.files.videoFile.length > 0) {
//         videoFileLocalPath = req.files.videoFile[0].path
//     }
//     console.log("Thumbnail Local path:",ThumbnailLocalPath);
//     console.log("videoFile Local path:",videoFileLocalPath);

//     if (!ThumbnailLocalPath) {
//         throw new ApiError(400, "Thumbnail is required")
//     }

//     if (!videoFileLocalPath) {
//         throw new ApiError(400, "video file is required")
//     }


//     // Upload Thumbnail and Video Saperately
     
//     const Thumbnail = await uploadOnCloudinary(ThumbnailLocalPath);
//     const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    

//       // Upload thumbnail and video in parallel
//     //   const [Thumbnail, videoFile] = await Promise.all([
//     //       uploadOnCloudinary(ThumbnailLocalPath),
//     //       uploadOnCloudinary(videoFileLocalPath)
//     //   ]);

//     console.log("Cloudinary Thumbnail URL:",Thumbnail.url);
//     console.log("Cloudinary video File URL:",videoFile.url);
//     if (!Thumbnail) {
//         throw new ApiError(400, "Thumbnail is not uploaded on Cloud")
//     }
//     if (!videoFile) {
//         throw new ApiError(400, "Video File is not uploaded on Cloud")
//     }
  

//     // hamara Video model directly Database k saath connected he
//     const video = await Video.create({
//         title,
//         description,
//         thumbnail: Thumbnail.url,
//         videoFile: videoFile.url,
//         owner: userId, //Save logged-in user's ID as owner
//         duration:videoFile.duration,// video lenght comming from cloud
//         })

//     const createdVideo = await Video.findById(video._id)

//     if (!createdVideo) {
//         throw new ApiError(500, "Something went wrong while adding Video")
//     }

//     //res.status ko hi zyada tr server accept--> res.json k ander status bhi theek hi he
//     return res.status(201).json(
//         new ApiResponse(200, createdVideo, "Video added Successfully")
//     )

//      }

//
/*add terminology*/
async (req,res,next,error) =>
    {
       /*Add terminology steps*/
  // get Terminology details from frontend
   // validation - not empty
   // check if Terminology already exists: term(Arabic), term Roman

   // create Terminology object - create entry in db
   // check for is Terminology added successfully
   // return response
   
   const {
          termArabic, 
          termRoman,
          explanationEnglish,
          explanationUrdu,
          explanationHindi,
          source, //source if aga sahab the pass ref
          reference,
          videoLink,
          otherReference,
          quranReferencesData
          } = req.body
   const userId = req.user?._id; //Assuming user is logged in & available in req.user
console.log("Data from front:",req.body)
let quranRefs = [];
try {
    //req.body se hume string form me Quran Refs mill rahe..
  quranRefs = JSON.parse(req.body.quranReferencesData);
} catch (err) {
  return res.status(400).json({ error: "Invalid quranReferencesData format (should be JSON array)" });
}

   console.log(" quranRefs in Json formate: ", quranRefs);

 // First, check all string fields
const stringFields = [
    termArabic, 
    termRoman,
    explanationEnglish,
    explanationUrdu,
    explanationHindi,
    source
  ];
  
  if (stringFields.some(field => typeof field !== 'string' || field.trim() === "")) {
    throw new ApiError(400, "All string fields are required");
  }
  
  // Then, separately check Quran References
//   if (!Array.isArray(quranRefs) || quranRefs.length === 0) {
//     throw new ApiError(400, "At least one Quran reference is required");
//   }
  
//   console.log("Quaran Ref:",quranReferences)
  // Then, separately check Quran References


   const videoExist = await Video.findOne({
       $or: [{ termArabic }, { termRoman }]
   })

   console.log("Terminology already present in Db:",videoExist);
   if (videoExist) {
       throw new ApiError(409, "Term already exists")
   }


   // hamara Video model directly Database k saath connected he

   //save Quaran References in saperate Table QuranReference
   
 const savedQuranRefs = await QuranReference.insertMany(quranRefs);
   console.log("Quran Refs Saved in Db",savedQuranRefs)
 
  
   const video = await Video.create({
       termArabic,
       termRoman,
       explanationEnglish,
       explanationUrdu,
       explanationHindi,
       source,
       reference:reference||"",
       videoLink:videoLink||"",
       otherReference:otherReference||"",
       owner: userId, //Save logged-in user's ID as owner
       quranReferences: savedQuranRefs.map(ref => ref._id)||[]//this is array of Ids
       })

   const createdVideo = await Video.findById(video._id)
console.log("Creayed video in Db:",createdVideo)
   if (!createdVideo) {
       throw new ApiError(500, "Something went wrong while adding Terminology")
   }

   //res.status ko hi zyada tr server accept--> res.json k ander status bhi theek hi he
   return res.status(201).json(
       new ApiResponse(200, createdVideo, "Term added Successfully")
   )

    }
 )


 // how to get all Terminologies:
//  const VideosList = AsyncHandler(async (req, res) => {
//     const Videos = await Video.find().sort({ createdAt: -1 }); // Newest first
  
//     return res.status(200).json(
//       new ApiResponse(
//         200,
//         Videos,
//         "Terminologies fetched successfully"
//       )
//     );
//   });

 const VideosList = AsyncHandler(async (req, res) => {
  // ------- Parse query-params -------
  const search = req.query.search || '';
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.max(parseInt(req.query.limit) || 10, 1);
  const skip = (page - 1) * limit;

  // ------- Build filter ------------
  let filter = {};

  // jin terms k 1st letters same hon ge woh aae gi
 if (search) {
  filter = {
    $or: [
      { termArabic: { $regex: `^${search}`, $options: 'i' } },
      { termRoman: { $regex: `^${search}`, $options: 'i' } },
      { explanationEnglish: { $regex: `^${search}`, $options: 'i' } },
      { explanationUrdu: { $regex: `^${search}`, $options: 'i' } },
      { explanationHindi: { $regex: `^${search}`, $options: 'i' } },
    ],
  };
}

  // ------- Query DB with pagination -------
  const [videos, totalCount] = await Promise.all([
    Video.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Video.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return res.status(200).json(
    new ApiResponse(200,
      {
        items: videos,
        meta: { page, limit, totalPages, totalCount },
      },
      'Terminologies fetched successfully'
    )
  );
});

  

// how to get single video:---> using populate method
// const getsingleVideo = AsyncHandler(async (req, res) => {
//     const video = await Video.findById(req.params.videoId)
//         .populate("owner", "fullName username avatar") // Owner ke sirf selected fields fetch karenge
//         .select("_id videoFile thumbnail title description owner"); // Sirf required fields select ki hain

//     if (!video) {
//         return res.status(404).json(new ApiResponse(404, null, "Video not found"));
//     }

//     return res.status(200).json(new ApiResponse(200, video, "Video fetched successfully"));
// });

// how to get single video:---> using aggregate method
// const getsingleVideo = AsyncHandler(async (req, res) => {
//     const video = await Video.aggregate([
//         {
//             $match: {
//                 _id: new mongoose.Types.ObjectId(req.params.videoId)
//             }
//         },
//         {
//             $lookup: {
//                 from: "users",
//                 localField: "owner",
//                 foreignField: "_id",
//                 as: "owner"
//             }
//         },
//         {
//             $unwind: {
//                 path: "$owner",
//                 preserveNullAndEmptyArrays: true
//             }
//         },
//         {
//             $project: {
//                 _id: 1,
//                 termArabic: 1,
//                 termRoman: 1,
//                 explanationEnglish: 1,
//                 explanationUrdu: 1,
//                 explanationHindi:1,
//                 source:1,
//                 reference:1,
//                 videoLink:1,

//                 owner: {
//                     fullName: 1,
//                     username: 1,
//                     avatar: 1
//                 }
//             }
//         }
//     ]);

//     console.log("Aggregated Video:", video);

//     return res
//         .status(200)
//         .json(
//             new ApiResponse(
//                 200,
//                 video[0] || null,
//                 "Video fetched successfully"
//             )
//         );
// });
const getsingleVideo = AsyncHandler(async (req, res) => {
    const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.params.videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $unwind: {
                path: "$owner",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "quranreferences", // <-- yahan apni Quran References wali collection ka naam
                localField: "quranReferences", // <-- yahan field jo Video me save hai (Array of IDs)
                foreignField: "_id",
                as: "quranReferences"
            }
        },
        {
            $project: {
                _id: 1,
                termArabic: 1,
                termRoman: 1,
                explanationEnglish: 1,
                explanationUrdu: 1,
                explanationHindi: 1,
                source: 1,
                reference: 1,
                otherReference:1,
                videoLink: 1,
                
                owner: {
                    fullName: 1,
                    username: 1,
                },
                quranReferences: 1 // <-- ab Quran References bhi response me aayengi
            }
        }
    ]);

    console.log("Aggregated Terminology:", video);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                video[0] || null,
                "Video fetched successfully"
            )
        );
});



// how to delete single video

const deleteSingleVideo = AsyncHandler(async (req, res) => {
    const videoId = req.params.videoId;

    // Find the video in the database
    const video = await Video.findById(videoId);
    if (!video) {
        return res.status(404).json(new ApiResponse(
            404,
            null,
            "Video not found"
        ));
    }


   
    // Delete video from database
    await Video.findByIdAndDelete(videoId);

    return res.status(200).json(new ApiResponse(
        200,
        null,
        "Term deleted successfully"
    ));
});


const updateVideoDetails = AsyncHandler(async (req, res, next) => {
    const {
        termArabic, 
        termRoman,
        explanationEnglish,
        explanationUrdu,
        explanationHindi,
        source, 
        reference,
        videoLink,
        otherReference,
        quranReferencesData // Array of Quran references to be updated or added
    } = req.body;

    console.log("Yeh Term hum modify krna Chah rahe:",req.body)

    const videoId = req.params.videoId; // Assuming video ID is passed in the request params

    const userId = req.user?._id; // Assuming user is logged in & available in req.user


    let quranRefs = [];
try {
    //req.body se hume string form me Quran Refs mill rahe..
  quranRefs = JSON.parse(req.body.quranReferencesData);
} catch (err) {
  return res.status(400).json({ error: "Invalid quranReferencesData format (should be JSON array)" });
}

   console.log(" quranRefs in Json formate: ", quranRefs);
    // Validate the fields
    const stringFields = [
        termArabic, 
        termRoman,
        explanationEnglish,
        explanationUrdu,
        explanationHindi,
        source,
        
        
    ];
    
    // Check if any string field is missing or invalid
    if (stringFields.some(field => typeof field !== 'string' || field.trim() === "")) {
        throw new ApiError(400, "All string fields are required");
    }
    
    // Validate Quran References (if provided)
    // if (quranRefs && (!Array.isArray(quranRefs) || quranRefs.length === 0)) {
    //     throw new ApiError(400, "At least one Quran reference is required if provided");
    // }

    // Find existing video (term) to update
    const existingVideo = await Video.findById(videoId);
    if (!existingVideo) {
        throw new ApiError(404, "Video not found in database");
    }

    // Check if the new term (Arabic or Roman) already exists (i.e., don't allow duplicate terms)
    const termExist = await Video.findOne({
        $or: [
            { termArabic },
            { termRoman }
        ]
    });
    
    // if (termExist && termExist._id.toString() !== videoId) {
    //     throw new ApiError(409, "Term already exists");
    // }

    // Update Quran references
    let updatedReferenceIds = []; // Start with the existing references

    if (quranRefs) {
        // Add or update Quran references
        for (const ref of quranRefs) {
            const refId = ref.id || ref._id;
            if (refId) {
                // If ID exists, update the reference
                const updatedRef = await QuranReference.findByIdAndUpdate(
                    refId, 
                    { $set: ref },
                    { new: true }
                );
                updatedReferenceIds = updatedReferenceIds.filter(id => id !==refId); // Remove the old reference id
                updatedReferenceIds.push(updatedRef._id); // Add updated reference ID
            } else {
                // If no ID, create a new reference
                const newRef = await QuranReference.create(ref);
                updatedReferenceIds.push(newRef._id); // Add new reference ID
            }
        }
    }

    // Prepare fields to update
    const updateFields = {};
    if (termArabic) updateFields.termArabic = termArabic;
    if (termRoman) updateFields.termRoman = termRoman;
    if (explanationEnglish) updateFields.explanationEnglish = explanationEnglish;
    if (explanationUrdu) updateFields.explanationUrdu = explanationUrdu;
    if (explanationHindi) updateFields.explanationHindi = explanationHindi;
    if (source) updateFields.source = source;
    if (reference) updateFields.reference = reference;
    if (videoLink) updateFields.videoLink = videoLink;
    // otherReference:otherReference||"",
    if (otherReference) updateFields.otherReference = otherReference;
    // Update the references in the video document
    if (updatedReferenceIds.length > 0) {
        updateFields.quranReferences = updatedReferenceIds;
    }
    if (updatedReferenceIds.length == 0) {
        updateFields.quranReferences = [];
    }

    // Update the video (term) in the database
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { $set: updateFields },
        { new: true }
    );

    if (!updatedVideo) {
        throw new ApiError(500, "Failed to update Terminology");
    }

    return res.status(200).json(new ApiResponse(200, updatedVideo, "Term updated successfully"));
});


 export {
    AddVideo,
    VideosList,
    getsingleVideo,
    deleteSingleVideo,
    updateVideoDetails
};