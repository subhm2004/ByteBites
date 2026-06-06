import { ObjectId } from "mongodb";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import TryCatch from "../middlewares/trycatch.js";
import { getUserCollection } from "../util/collection.js";

export const listUsers = TryCatch(async (_req, res) => {
  const users = await (await getUserCollection())
    .find({})
    .sort({ createdAt: -1 })
    .limit(100)
    .project({
      name: 1,
      email: 1,
      image: 1,
      role: 1,
      isBanned: 1,
      createdAt: 1,
    })
    .toArray();

  res.json({ count: users.length, users });
});

export const setUserBanStatus = TryCatch(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { isBanned } = req.body;

  if (!id || typeof id !== "string" || !ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid user id" });
  }

  if (req.user?._id && String(req.user._id) === id) {
    return res.status(400).json({ message: "You cannot change your own status" });
  }

  if (typeof isBanned !== "boolean") {
    return res.status(400).json({ message: "isBanned must be true or false" });
  }

  const result = await (await getUserCollection()).updateOne(
    { _id: new ObjectId(id) },
    { $set: { isBanned, updatedAt: new Date() } }
  );

  if (result.matchedCount === 0) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({
    message: isBanned ? "User banned successfully" : "User unbanned successfully",
    isBanned,
  });
});
