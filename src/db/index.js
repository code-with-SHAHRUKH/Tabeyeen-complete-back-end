import {DB_NAME} from "../constants.js";
import mongoose from "mongoose";

const ConnectDB=async () =>
    {
try {
    let res=await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    console.log("hi server is connected with DB on this Host:",res.connection.host);// on which host the server is conneteing with DB
  
} catch (error) {
    console.log("Error during connection:",error);
    process.exit(1)
}
}
export default ConnectDB