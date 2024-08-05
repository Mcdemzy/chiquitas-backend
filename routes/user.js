import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import nodemailer from "nodemailer";

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;

    // Check if all fields are provided
    if (!firstname || !lastname || !email || !password) {
      return res
        .status(400)
        .json({ status: false, error: "All fields are required" });
    }

    // Check if user already exists
    const user = await User.findOne({ email });
    if (user) {
      return res
        .status(409)
        .json({ status: false, error: "Email is already in use" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      firstname,
      lastname,
      email,
      password: hashedPassword,
    });

    // Save the new user
    await newUser.save();

    return res
      .status(201)
      .json({ status: true, message: "User registered successfully" });
  } catch (error) {
    console.error("Error during user signup:", error);
    return res
      .status(500)
      .json({ status: false, error: "Internal Server Error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if all fields are provided
    if (!email || !password) {
      return res
        .status(400)
        .json({ status: false, error: "All fields are required" });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ status: false, error: "User not registered" });
    }

    // Check if the password is correct
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res
        .status(401)
        .json({ status: false, error: "Incorrect password" });
    }

    // Generate a token
    const token = jwt.sign({ email: user.email }, process.env.KEY, {
      expiresIn: "1h",
    });

    // Set the token as a cookie
    res.cookie("token", token, {
      httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
      secure: process.env.NODE_ENV, // Use HTTPS in production
      maxAge: 3600000, // 1 hour
      sameSite: "lax", // Use 'lax' if you need to support cross-origin requests
    });

    // Successful login
    return res.status(200).json({ status: true, message: "Login successful" });
  } catch (error) {
    console.error("Error during user login:", error);
    return res
      .status(500)
      .json({ status: false, error: "Internal Server Error" });
  }
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not registered" });
    }

    const token = jwt.sign({ id: user._id }, process.env.KEY, {
      expiresIn: "5m",
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Reset Password",
      text: `http://localhost:5173/reset-password/${token}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ error: "Error sending email" });
      } else {
        return res.json({ status: true, message: "Email sent" });
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  try {
    const decoded = await jwt.verify(token, process.env.KEY);
    const id = decoded.id;
    const hashPassword = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate({ _id: id }, { password: hashPassword });
    return res.json({ status: true, message: "Updated Password" });
  } catch (err) {
    return res.json("Invalid token");
  }
});

const verifyUser = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    console.log("Received token:", token);
    if (!token) {
      return res.status(401).json({ status: false, message: "No token" });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.KEY);
    console.log("Decoded token:", decoded);

    // Find the user by email
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    req.user = user; // Attach user to request object
    next();
  } catch (err) {
    // Handle specific JWT errors
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ status: false, message: "Token expired" });
    } else if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ status: false, message: "Invalid token" });
    }
    // General error handling
    console.error("Verification error:", err);
    return res
      .status(500)
      .json({ status: false, error: "Internal server error" });
  }
};

router.get("/verify", verifyUser, (req, res) => {
  return res.status(200).json({ status: true, user: req.user });
});

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ status: true, message: "Logged out" });
});

export { router as UserRouter };
