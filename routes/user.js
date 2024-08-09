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
    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "2 days",
    });

    // Set the token as a cookie
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 3600000,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
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

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
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
        console.error("Error sending email:", error);
        return res.status(500).json({ error: "Error sending email" });
      } else {
        console.log("Email sent:", info.response);
        return res.json({ status: true, message: "Email sent" });
      }
    });
  } catch (err) {
    console.error("Error in forgot-password:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const id = decoded.id;
    const hashPassword = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate({ _id: id }, { password: hashPassword });
    return res.json({ status: true, message: "Updated Password" });
  } catch (err) {
    console.error("Error resetting password:", err);
    return res.status(400).json({ status: false, error: "Invalid token" });
  }
});

const verifyUser = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ status: false, message: "No token" });
    }
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    // req.user = decoded; // Optionally attach decoded user to the request
    next();
  } catch (err) {
    console.error("Error verifying token:", err);
    return res.status(401).json({ status: false, error: "Unauthorized" });
  }
};

router.get("/verify", verifyUser, (req, res) => {
  return res.json({ status: true, message: "Authorized" });
});

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ status: true, message: "Logged out" });
});

export { router as UserRouter };
