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



//Same Above work in Prisma   :)
//video model

/*
model Video {
  id                 Int                @id @default(autoincrement())
  termArabic         String
  termRoman          String
  explanationEnglish String
  explanationUrdu    String
  explanationHindi   String
  source             String
  reference          String?            // optional
  videoLink          String?            // optional
  otherReference     String?            // optional
  ownerId            Int?
  owner              User?              @relation(fields: [ownerId], references: [id])
  quranReferences    QuranReference[]   @relation("VideoQuranReferences")

  createdAt          DateTime           @default(now())
  updatedAt          DateTime           @updatedAt
}
  */



//user model  which is connected with video model

/*
model User {
  id     Int     @id @default(autoincrement())
  // Add more fields as needed
  videos Video[]
}
*/



//Quran model which is connected with video model
/*
model QuranReference {
  id     Int     @id @default(autoincrement())
  // Add your Quran reference fields here
  videos Video[] @relation("VideoQuranReferences")
}
*/