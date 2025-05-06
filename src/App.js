import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
const app=express();
app.use(cors({
    origin:process.env.CORS_ORIGIN,// some time is me hum aik array det eh jis me mibile or web k front ka URL hota he
    credentials:true
}))
app.use(express.json({limit:"20kb"}));// alow server to accept json data
app.use(express.urlencoded({extended:true,limit:"20kb"}))// alow server to accept updated url data
app.use(express.static("public")) // alow server to accept static files
app.use(cookieParser())// se detail from notes

//routes import
import userRouter from './routes/user.routes.js'
import videoRouter from './routes/video.routes.js'

//routes declaration

app.use("/api/v1/users", userRouter)//jese hi user /api/v1/users ko visit kare ga to user router activate ho jy ga or controll is me chala jy ga
app.use("/api/v1/videos", videoRouter)



export default app;