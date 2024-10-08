import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import nodemailer from "nodemailer";

const router = express.Router();
// Middleware to verify the token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer token

  if (!token) return res.sendStatus(401); // If no token is provided

  jwt.verify(token, process.env.KEY, (err, user) => {
    if (err) return res.sendStatus(403); // Invalid token
    req.user = user;
    next();
  });
};
// Utility function to handle errors
const handleError = (res, statusCode, message) => {
  return res.status(statusCode).json({ status: false, error: message });
};

// Middleware to verify user
const verifyUser = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return handleError(res, 401, "No token provided");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return handleError(res, 404, "User not found");
    }

    req.user = user; // Attach user to request object
    next();
  } catch (err) {
    return handleError(res, 401, "Invalid token");
  }
};

// Signup route
router.post("/signup", async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;

    if (!firstname || !lastname || !email || !password) {
      return handleError(res, 400, "All fields are required");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return handleError(res, 409, "Email is already in use");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstname,
      lastname,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    return res
      .status(201)
      .json({ status: true, message: "User registered successfully" });
  } catch (error) {
    console.error("Error during user signup:", error);
    return handleError(res, 500, "Internal Server Error");
  }
});

// Login route
// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return handleError(res, 400, "All fields are required");
//     }

//     const user = await User.findOne({ email });
//     if (!user) {
//       return handleError(res, 401, "User not registered");
//     }

//     const isValidPassword = await bcrypt.compare(password, user.password);
//     if (!isValidPassword) {
//       return handleError(res, 401, "Incorrect password");
//     }

//     const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
//       expiresIn: "1h",
//     });

//     res.cookie("token", token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       maxAge: 3600000,
//       sameSite: "lax",
//     });

//     return res.status(200).json({ status: true, message: "Login successful" });
//   } catch (error) {
//     console.error("Error during user login:", error);
//     return handleError(res, 500, "Internal Server Error");
//   }
// });
// added
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
    console.log(token);

    // Set the token as a cookie
    res.cookie("token", token, { httpOnly: true, maxAge: 3600000 });

    // Successful login
    return res.status(200).json({
      status: true,
      message: "Login successful",
      token: token, // Include the token in the response body
    });
  } catch (error) {
    console.error("Error during user login:", error);
    return res
      .status(500)
      .json({ status: false, error: "Internal Server Error" });
  }
});
// end added
// Forgot Password route
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return handleError(res, 404, "User not registered");
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
      text: `https://www.chiquitasinventory.com/reset-password/${token}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return handleError(res, 500, "Error sending email");
      } else {
        return res.json({ status: true, message: "Email sent" });
      }
    });
  } catch (err) {
    console.error("Error in forgot password:", err);
    return handleError(res, 500, "Internal server error");
  }
});

// Reset Password route
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    const id = decoded.id;
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(id, { password: hashedPassword });
    return res.json({ status: true, message: "Password updated successfully" });
  } catch (err) {
    console.error("Error resetting password:", err);
    return handleError(res, 400, "Invalid or expired token");
  }
});

// Verify User route
router.get("/verify", verifyUser, (req, res) => {
  return res.json({ status: true, user: req.user });
});

// Logout route
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ status: true, message: "Logged out" });
});

//added
router.get("/user", verifyUser, async (req, res) => {
  try {
    // req.user is available here because it's attached by the verifyUser middleware
    const user = req.user;

    // Return all the data for the authenticated user
    return res.status(200).json({
      status: true,
      user: {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        // Include any other relevant fields from the User model
      },
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return res
      .status(500)
      .json({ status: false, error: "Internal Server Error" });
  }
});

// Endpoint to get user details
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ status: false, error: "User not found" });
    }

    // Return user details excluding sensitive info like password
    const { password, ...userDetails } = user.toObject();
    return res.status(200).json({ status: true, user: userDetails });
  } catch (error) {
    console.error("Error fetching user details:", error);
    return res
      .status(500)
      .json({ status: false, error: "Internal Server Error" });
  }
});
export { router as UserRouter };
