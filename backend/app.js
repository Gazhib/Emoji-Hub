const express = require("express");
const cors = require("cors");
const { SignJWT, jwtVerify } = require("jose");
const { userSchema } = require("./schemas.js");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const cookieParser = require("cookie-parser");
require("dotenv").config({ path: "../.env" });
const db = process.env.DATABASE_URL;
const secretKey = process.env.SECRET_KEY
const app = express();
const secret = new TextEncoder().encode(secretKey);

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

async function connectDatabase() {
  await mongoose.connect(db);
  console.log("Connected to database");
}
connectDatabase();

async function hashPassword(password) {
  const salt = 10;
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

async function createToken(email) {
  return await new SignJWT({ sub: email })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h")
    .sign(secret);
}

async function verifyToken(token) {
  const { payload } = await jwtVerify(token, secret);
  return payload.sub;
}

async function authMiddleware(req, res, next) {
  try {
    const auth = req.cookies.accessToken;
    const email = await verifyToken(auth);
    req.email = email;
    next();
  } catch {
    return res.status(401).end();
  }
}

const User = mongoose.model("users", userSchema, "users");

app.get("/getEmojis", async (req, res) => {
  const response = await fetch("https://emojihub.yurace.pro/api/all");
  let responseData = await response.json();
  responseData = responseData.filter((emoji) => emoji.category !== "flags");
  responseData.sort((a, b) => a.name.localeCompare(b.name));
  const byCategory = {};
  const byAlphabet = new Map();
  for (let i = 0; i < responseData.length; i++) {
    if (!(responseData[i].category in byCategory)) {
      byCategory[responseData[i].category] = [];
    }
    if (!(responseData[i].name[0] in byAlphabet)) {
      byAlphabet[responseData[i].name[0]] = [];
    }
    byAlphabet[responseData[i].name[0]].push(responseData[i]);
    byCategory[responseData[i].category].push(responseData[i]);
  }
  return res.json({ byAlphabet, byCategory });
});

app.post("/api/login", async (req, res) => {
  const { password, email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json("No user like that");
  }

  const isCorrectPassword = await bcrypt.compare(password, user.password);
  if (!isCorrectPassword) {
    return res.status(401).json("Not correct password");
  }

  const accessToken = await createToken(email);
  res
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    })
    .json({ accessToken });
});

app.post("/api/registration", async (req, res) => {
  const { password, email, confirmPassword } = req.body;
  if (confirmPassword !== password) {
    return res.status(400).json("Passwords do not match");
  }
  const user = await User.findOne({ email });
  if (user) {
    return res.status(409).json("The email is already registered");
  }

  if (email.trim() === "") {
    return res.status(400).json("Email is irrelevant");
  }
  if (password.trim() === "" || password.trim() !== password) {
    return res.status(400).json("Password is irrelevant");
  }

  const hashedPassword = await hashPassword(password);

  const accessToken = await createToken(email);

  const newUser = new User({
    email,
    password: hashedPassword,
  });

  await newUser.save();

  res
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    })
    .json({ accessToken });
});

app.get("/api/me", authMiddleware, (req, res) => [
  res.json({ email: req.email }),
]);

app.post("/api/logout", (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });
  res.status(200).json({ message: "Logged out successfully" });
});

app.post("/is-favourite-sticker", authMiddleware, async (req, res) => {
  const { emoji } = req.body;
  const email = req.email;
  const user = await User.findOne({ email });
  if (!user) {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });
    return req.status(400).json("Something went wrong...");
  }

  for (const favourite of user.favourites["Your favourite stickers"]) {
    if (favourite.name === emoji.name)
      return res.status(201).json("You already have that sticker as favourite");
  }

  return res.status(200).json("Sticker is not favourite");
});

app.post("/add-favourite-sticker", authMiddleware, async (req, res) => {
  const { emoji } = req.body;
  const email = req.email;
  const user = await User.findOne({ email });
  if (!user) {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });
    return req.status(400).json("Something went wrong...");
  }

  for (const favourite of user.favourites["Your favourite stickers"]) {
    if (favourite.name === emoji.name)
      return res.status(201).json("You already have that sticker as favourite");
  }

  user.favourites["Your favourite stickers"].push(emoji);
  user.markModified("favourites");
  await user.save();
  return res
    .status(200)
    .json("You have successfully added sticker to favourites");
});

app.post("/delete-favourite-sticker", authMiddleware, async (req, res) => {
  const { emoji } = req.body;
  const email = req.email;
  const user = await User.findOne({ email });
  if (!user) {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });
    return req.status(400).json("Something went wrong...");
  }

  user.favourites["Your favourite stickers"] = user.favourites[
    "Your favourite stickers"
  ].filter((fav) => fav.name !== emoji.name);

  user.markModified("favourites");
  await user.save();
  return res
    .status(200)
    .json("You have successfully removed sticker from favourites");
});

app.get("/get-favourite-sticker", authMiddleware, async (req, res) => {
  const email = req.email;
  const user = await User.findOne({ email });
  if (!user) {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });
    return req.status(400).json("Something went wrong...");
  }

  return res.status(200).json(user.favourites);
});

app.listen(3000, () => {
  console.log(`server is running on 3000`);
});
