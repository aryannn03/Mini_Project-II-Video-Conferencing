import { Router } from "express";
import { addToHistory, getUserHistory, login, register } from "../controllers/user.controller.js";
import axios from "axios";
import multer from "multer";
import FormData from "form-data";
import fs from "fs";
const router = Router(); // Moved this line up FIRST

const upload = multer({ dest: "uploads/" });

router.post("/summarize", upload.single("video"), async (req, res) => {
    try {
        const form = new FormData();
        form.append("file", fs.createReadStream(req.file.path), {
            filename: req.file.originalname,
        });

        const response = await axios.post("http://127.0.0.1:8001/summarize/", form, {
            headers: form.getHeaders(),
        });

        res.json(response.data);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: error.message });
    }
});


router.route("/login").post(login)
router.route("/register").post(register)
router.route("/add_to_activity").post(addToHistory)
router.route("/get_all_activity").get(getUserHistory)

export default router;