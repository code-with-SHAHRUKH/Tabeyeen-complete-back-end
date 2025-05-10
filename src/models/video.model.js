import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    //old video data
    // {
    //     videoFile: {
    //         type: String, //cloudinary url
    //         required: true
    //     },
    //     thumbnail: {
    //         type: String, //cloudinary url
    //         required: true
    //     },
    //     title: {
    //         type: String,
    //         required: true
    //     },
    //     description: {
    //         type: String,
    //         required: true
    //     },
    //     duration: {
    //         type: Number,
    //         required: false
    //     },
    //     views: {
    //         type: Number,
    //         default: 0
    //     },
    //     isPublished: {
    //         type: Boolean,
    //         default: true
    //     },
    //     owner: {
    //         type: Schema.Types.ObjectId,// passing ref of user model
    //         ref: "User"
    //     }
    // }
    {
        termArabic: {
          type: String,
          required: true, // Depends on your admin rule (can make it required if needed)
        },
        termRoman: {
          type: String,
          required: true,
        },
        explanationEnglish: {
          type: String,
          required: true,
        },
        explanationUrdu: {
          type: String,
          required: true,
        },
        explanationHindi: {
          type: String,
          required: true,
        },
        source: {
          type: String,
          required: true,
        },
        reference: {
          type: String,
          required: false,
        },
        videoLink: {
          type: String,
          required: false,
        },
        otherReference: {
          type: String,
          required: false,
        },
        owner: {
                    type: Schema.Types.ObjectId,// passing ref of user model
                    ref: "User"
        },
        quranReferences: [
            {
                type:Schema.Types.ObjectId,
                ref:'QuranReference'
            }
          ]
          
      },
    
    {
        timestamps: true
    }
)

videoSchema.plugin(mongooseAggregatePaginate);// now we can write aggregation queries

export const Video = mongoose.model("Video", videoSchema)