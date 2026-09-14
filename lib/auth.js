import jwt from "jsonwebtoken";

export function verifyAdminToken(
  token
) {

  if (!token) {

    return null;

  }


  try {

    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );


    if (
      decoded.role !== "admin"
    ) {

      return null;

    }


    return decoded;


  } catch (error) {

    return null;

  }

}