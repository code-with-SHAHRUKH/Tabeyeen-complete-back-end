import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true, 
            index: true,// for searching purpose
        },
        email: {
            type: String,
            required: false,
            unique: true,
            lowecase: true,
            trim: true, 
        },
        fullName: {
            type: String,
            required: true,
            trim: true, 
            index: true,// for searching purpose
        },
        role: {
            type: String,
            enum: ['admin', 'Data Entry Operator'],
            required: true
          },
          
        avatar: {
            type: String, // cloudinary url
            // required: true,
        },
        coverImage: {
            type: String, // cloudinary url
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: [false, 'Password is required only in case of Super admin']
        },
        refreshToken: {
            type: String
        }

    },
    {
        timestamps: true
    }
)
// password encription(we also use middle ware in moongoose)
userSchema.pre("save", async function (next) {
    // if pasword field modifyied he to hi ye work kare ga... nhi to nhi kare ga

    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

// we can store methods in Schema  User model ne hamare liye use create kiya hum new methotds user me daal rahe
userSchema.methods.isPasswordCorrect = async function(password){
    //compare hone me time lage ga is lea wait karo
    //this.password-->come from userSchema/db
    //password-->come from user inut box
    return await bcrypt.compare(password, this.password)// if p/w matched return true 
}

//we generate AccesToken from user data,ACCESS_TOKEN_SECRET,ACCESS_TOKEN_EXPIRY
userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName,
            role: this.role  // Add role to the token payload
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

//we generate RefreshToken from user data, REFRESH_TOKEN_SECRET, REFRESH_TOKEN_EXPIRY
userSchema.methods.generateRefreshToken = function(){
    //jwt.sign generate the tokens
    return jwt.sign(
        {
            _id: this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
// yehi model mera db k saath linked he--> ise per hum Mongo k cruid opt lgae ge
// ise hum us file me import kre ge jha hum ne DB me user add/del/update krna hoga
export const User = mongoose.model("User", userSchema)