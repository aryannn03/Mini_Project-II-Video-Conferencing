import httpStatus from "http-status";
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { Meeting } from "../models/meeting.model.js";

const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(httpStatus.BAD_REQUEST).json({ 
            success: false,
            message: "Username and password are required" 
        });
    }

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ 
                success: false,
                message: "User not found" 
            });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (isPasswordCorrect) {
            const token = crypto.randomBytes(20).toString("hex");
            
            // Update user with new token
            user.token = token;
            await user.save();
            
            return res.status(httpStatus.OK).json({ 
                success: true,
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    username: user.username
                }
            });
        } else {
            return res.status(httpStatus.UNAUTHORIZED).json({ 
                success: false,
                message: "Invalid username or password" 
            });
        }
    } catch (error) {
        console.error("Login error:", error);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ 
            success: false,
            message: "Internal server error" 
        });
    }
};

const register = async (req, res) => {
    const { name, username, password } = req.body;

    if (!name || !username || !password) {
        return res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            message: "Name, username, and password are required"
        });
    }

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(httpStatus.CONFLICT).json({ 
                success: false,
                message: "Username already exists" 
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            username,
            password: hashedPassword
        });

        await newUser.save();

        return res.status(httpStatus.CREATED).json({ 
            success: true,
            message: "User registered successfully" 
        });
    } catch (error) {
        console.error("Registration error:", error);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ 
            success: false,
            message: "Internal server error" 
        });
    }
};

const getUserHistory = async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            message: "Authentication token is required"
        });
    }

    try {
        const user = await User.findOne({ token });
        
        if (!user) {
            return res.status(httpStatus.UNAUTHORIZED).json({
                success: false,
                message: "Invalid or expired token"
            });
        }
        
        const meetings = await Meeting.find({ user_id: user.username });
        
        return res.status(httpStatus.OK).json({
            success: true,
            meetings
        });
    } catch (error) {
        console.error("Get history error:", error);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const addToHistory = async (req, res) => {
    const { token, meeting_code } = req.body;

    if (!token || !meeting_code) {
        return res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            message: "Token and meeting code are required"
        });
    }

    try {
        const user = await User.findOne({ token });
        
        if (!user) {
            return res.status(httpStatus.UNAUTHORIZED).json({
                success: false,
                message: "Invalid or expired token"
            });
        }

        const newMeeting = new Meeting({
            user_id: user.username,
            meetingCode: meeting_code
        });

        await newMeeting.save();

        return res.status(httpStatus.CREATED).json({
            success: true,
            message: "Meeting added to history"
        });
    } catch (error) {
        console.error("Add to history error:", error);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export { login, register, getUserHistory, addToHistory };