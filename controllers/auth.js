import User from "../models/user.js";
import { createUserSchema } from "../schemas/userSchemas.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import gravatar from "gravatar";
import * as fs from "node:fs/promises";
import path from "node:path";
import Jimp from "jimp";
import mail from "../mail.js";
import crypto from "node:crypto";

async function register(req, res, next) {
  const { error } = createUserSchema.validate(req.body);

  if (error) {
    return res.status(400).send({ message: error.message });
  }

  const { password, email, subscription } = req.body;

  const emailInLowerCase = email.toLowerCase();

  try {
    const user = await User.findOne({ email: emailInLowerCase });

    if (user !== null) {
      return res.status(409).send({ message: "Email in use" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const verificationToken = crypto.randomUUID();

    const avatarURL = gravatar.url(email, { s: "200", r: "pg", d: "mm" });

    const newUser = await User.create({
      password: passwordHash,
      email: email.toLowerCase(),
      subscription,
      avatarURL,
      verificationToken,
    });

    mail.sendMail({
      to: emailInLowerCase,
      from: "mister.gimnast@gmail.com",
      subject: `Welcom ${emailInLowerCase}`,
      html: `To confirm your email click on the <a href="http://localhost:3000/api/users/verify/${verificationToken}">Link</a>`,
      text: `To confirm your email open the link http://localhost:3000/api/users/verify/${verificationToken}`,
    });

    res.status(201).send({
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
        avatarURL: newUser.avatarURL,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  const { email, password } = req.body;

  const emailInLowerCase = email.toLowerCase();

  try {
    const user = await User.findOne({ email: emailInLowerCase });

    if (user === null) {
      return res.status(401).send({ message: "Email or password is wrong" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch === false) {
      return res.status(401).send({ message: "Email or password is wrong" });
    }

    if (user.verify === false) {
      return res.status(401).send({ message: "Please verify your email" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: 60 * 60 }
    );

    await User.findByIdAndUpdate(user.id, { token });

    res.status(200).send({
      token,
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function logout(req, res, next) {
  try {
    await User.findByIdAndUpdate(req.user.id, { token: null });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

async function current(req, res, next) {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    res.status(200).json({
      email: user.email,
      subscription: user.subscription,
    });
  } catch (error) {
    next(error);
  }
}

async function uploadAvatar(req, res, next) {
  try {
    const uploadedFilePath = path.resolve("public/avatars", req.file.filename);

    await fs.rename(req.file.path, uploadedFilePath);

    const image = await Jimp.read(uploadedFilePath);

    image.resize(250, 250);

    await image.writeAsync(uploadedFilePath);

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatarURL: req.file.filename },
      { new: true }
    );

    if (user === null) {
      return res.status(401).send({ message: "Not authorized" });
    }
    res.status(200).send({ avatarURL: user.avatarURL });
  } catch (error) {
    next(error);
  }
}

async function verify(req, res, next) {
  const { verificationToken } = req.params;

  try {

    const user = await User.findOne({ verificationToken });

    if (user === null) {
      res.status(404).send({ message: "User not found" });
    }

    await User.findByIdAndUpdate(user.id, {
      verify: true,
      verificationToken: null,
    });

    res.status(200).send({ message: "Verification successful" });
  } catch (error) {
    next(error);
  }
}

export default { register, login, logout, current, uploadAvatar, verify };
