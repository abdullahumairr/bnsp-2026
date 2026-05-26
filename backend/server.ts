// Jalur import harus menyertakan .js di ujungnya
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js'; 
import userRoutes from './routes/userRoutes.js';
import bookRoutes from './routes/bookRoutes.js'; // sesuaikan dengan nama file kamu

dotenv.config();

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api", apiRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`BookVerse Server Running on port ${PORT}`);
});
