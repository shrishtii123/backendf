import app from "./app.js";
import cloudinary from "cloudinary";
import https from "https"; // Use 'http' for HTTP or 'https' for HTTPS

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Self-ping every 10 minutes to keep the server active
const serverURL = `${process.env.OPO}`; // Change to your public URL if needed

setInterval(() => {
  https.get(serverURL, (res) => {
    console.log(`Server pinged: ${res.statusCode}`);
  }).on("error", (err) => {
    console.error("Error pinging the server:", err.message);
  });
}, 600000); // 10 minutes in milliseconds (600,000 ms)

app.listen(process.env.PORT, () => {
  console.log(`Server listening at port ${process.env.PORT}`);
});
