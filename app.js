import express from "express";
import { dbConnection } from "./database/dbConnection.js";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import fileUpload from "express-fileupload";
import { errorMiddleware } from "./middlewares/error.js";
import messageRouter from "./router/messageRouter.js";
import userRouter from "./router/userRouter.js";
import jobApplicationRouter from "./router/jobApplicationRouter.js";
import companyRoutes from "./router/companyRoutes.js"
import testRouter from "./router/testRouter.js";
import {sendOtp,verifyOtp} from "./controller/otpController.js";
import { sendBulkEmails, sendCorrectionEmail } from "./controller/eController.js";

const app = express();
config({ path: ".env" });

app.use(
  cors({
    origin: true,  // Allow all origins
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
  })
);


app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);
app.post("/api/v1/sendOtp", sendOtp);
app.post("/api/v1/verifyOtp", verifyOtp);
app.post("/api/v1/sendCorrectionEmail", sendCorrectionEmail);
app.post("/api/v1/sendEmail", sendBulkEmails);

app.use("/api/v1/company", companyRoutes);
app.use("/api/v1/message", messageRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/jobApplication", jobApplicationRouter);
app.use("/api/v1/test", testRouter);


dbConnection();

app.use(errorMiddleware);

export default app;
