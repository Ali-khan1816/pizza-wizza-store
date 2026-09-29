// Last edited by you@example.com @ 23/09/26 09:43.
import jwt from "jsonwebtoken";

export function getAdminToken(req) {
  const cookieHeader = req.headers.cookie || "";

  const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
    const [key, ...value] = cookie.trim().split("=");

    if (key) {
      acc[key] = decodeURIComponent(value.join("="));
    }

    return acc;
  }, {});

  return cookies.adminToken || null;
}

export function verifyAdmin(req) {
  const token = getAdminToken(req);

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return null;
    }

    if (decoded.email !== process.env.ADMIN_EMAIL) {
      return null;
    }

    return decoded;
  } catch (error) {
    return null;
  }
}
