const express = require('express');
const cors = require('cors');  // Import cors
const dotenv = require("dotenv");
const nodecrn = require("node-cron"); // Scheduling tasks
const userRouter = require("./Routes/User_router");
const courseRouter = require("./Routes/Course_router");
const otherRoute = require("./Routes/Other_routes");
const connectdb = require("./Config/Database/ConnectMD");
const errorHandler = require("./Middleware/Error");
const cookieparser = require("cookie-parser");
const paymentRouter = require("./Routes/Payments");
const cloudinary = require("cloudinary");
const Razorpay = require("razorpay");
const PORT = 4000;

dotenv.config({ path: "./Config/.env" });

const app = express();


const allowedOrigins = [
  'http://localhost:3000', // Development
  'https://coursebundlearr-5nkdpaajh-md-tauseefs-projects.vercel.app' // Production (Vercel)
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: 'GET, POST, PUT, DELETE',
  credentials: true,
}));



app.use(express.json());
app.use(express.urlencoded({
  extended: true,
}));

app.use(cookieparser());

app.use("/api/auth", userRouter);
app.use("/api/courses", courseRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/other", otherRoute);

app.use(errorHandler);

// Configure Razorpay
const instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_SECREAT_KEY,
});

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLIENT_NAME,
  api_key: process.env.CLOUDINARY_CLIENT_API,
  api_secret: process.env.CLOUDINARY_CLIENT_SECRET,
});

// Schedule tasks
nodecrn.schedule("0 0 0 5 * *", async () => {
  try {
    const stats = await Stats.create({});
    console.log("New Stats document created:", stats);
  } catch (error) {
    console.error("Error creating Stats document:", error.message);
  }
});

// Connect to the database and start the server
connectdb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running at port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error starting the server:", error);
    process.exit(1);
  });

module.exports = instance;
