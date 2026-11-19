import { Router } from "express";
import { z } from "zod";
import { asyncHandler, validateBody } from "../lib/validate.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import { signToken } from "../lib/jwt.js";
import { requireAuth, toPublicUser } from "../middleware/auth.js";
import { HttpError } from "../middleware/error.js";
import { verifyFirebaseIdToken } from "../lib/firebase-token.js";

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().email("A valid email is required").toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Za-z]/, "Password must contain a letter")
    .regex(/[0-9]/, "Password must contain a number"),
  phone: z.string().min(6).max(20).optional().nullable(),
});

const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

const profileSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  phone: z.string().min(6).max(20).nullable().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).regex(/[A-Za-z]/).regex(/[0-9]/),
});

const addressSchema = z.object({
  label: z.string().min(1).max(40).default("Home"),
  fullName: z.string().min(2).max(80),
  phone: z.string().min(6).max(20),
  country: z.string().min(2).max(60),
  city: z.string().min(2).max(60),
  address: z.string().min(5).max(200),
  instructions: z.string().max(300).nullable().optional(),
  isDefault: z.boolean().default(false),
});

router.post(
  "/register",
  validateBody(registerSchema),
  asyncHandler(async (req, res) => {
    const store = req.app.locals.store;
    const { name, email, password, phone } = req.body;
    const existing = await store.findUserByEmail(email);
    if (existing) throw new HttpError(409, "An account with this email already exists");
    const user = await store.createUser({
      name,
      email,
      phone: phone ?? null,
      role: "customer",
      passwordHash: await hashPassword(password),
    });
    const token = signToken({ sub: user.id, role: user.role });
    res.status(201).json({ token, user: toPublicUser(user) });
  }),
);

const firebaseLoginSchema = z.object({ idToken: z.string().min(20) });

/** Firebase identity login (Google / Phone OTP / verified email) → same app session. */
router.post(
  "/firebase",
  validateBody(firebaseLoginSchema),
  asyncHandler(async (req, res) => {
    const store = req.app.locals.store;
    const identity = await verifyFirebaseIdToken(req.body.idToken);
    if (!identity.uid) throw new HttpError(400, "Firebase token has no subject");

    let user = await store.findUserByFirebaseUid(identity.uid);
    if (!user && identity.email) {
      const byEmail = await store.findUserByEmail(identity.email.toLowerCase());
      if (byEmail) {
        user = await store.updateUser(byEmail.id, {
          firebaseUid: identity.uid,
          photoUrl: identity.picture,
          emailVerified: identity.emailVerified,
          phone: byEmail.phone ?? identity.phone,
        });
      }
    }
    if (!user) {
      user = await store.createUser({
        name: identity.name ?? (identity.email ? identity.email.split("@")[0] : "KAJOK User"),
        email: (identity.email ?? `${identity.uid}@firebase.kajok.app`).toLowerCase(),
        passwordHash: "",
        role: "customer",
        phone: identity.phone ?? null,
        firebaseUid: identity.uid,
        photoUrl: identity.picture,
        country: null,
        emailVerified: identity.emailVerified,
      });
    }
    const token = signToken({ sub: user.id, role: user.role });
    res.json({ token, user: toPublicUser(user) });
  }),
);

router.post(
  "/login",
  validateBody(loginSchema),
  asyncHandler(async (req, res) => {
    const store = req.app.locals.store;
    const { email, password } = req.body;
    const user = await store.findUserByEmail(email);
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      throw new HttpError(401, "Invalid email or password");
    }
    const token = signToken({ sub: user.id, role: user.role });
    res.json({ token, user: toPublicUser(user) });
  }),
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json({ user: toPublicUser(req.user!) });
  }),
);

router.put(
  "/profile",
  requireAuth,
  validateBody(profileSchema),
  asyncHandler(async (req, res) => {
    const store = req.app.locals.store;
    const updated = await store.updateUser(req.user!.id, req.body);
    res.json({ user: toPublicUser(updated!) });
  }),
);

router.put(
  "/password",
  requireAuth,
  validateBody(passwordSchema),
  asyncHandler(async (req, res) => {
    const store = req.app.locals.store;
    const { currentPassword, newPassword } = req.body;
    const user = await store.findUserById(req.user!.id);
    if (!user || !(await verifyPassword(currentPassword, user.passwordHash))) {
      throw new HttpError(400, "Current password is incorrect");
    }
    await store.updateUser(user.id, { passwordHash: await hashPassword(newPassword) });
    res.json({ ok: true });
  }),
);

// ---------- Saved addresses ----------
router.get(
  "/addresses",
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json({ items: await req.app.locals.store.listAddresses(req.user!.id) });
  }),
);

router.post(
  "/addresses",
  requireAuth,
  validateBody(addressSchema),
  asyncHandler(async (req, res) => {
    const address = await req.app.locals.store.createAddress({ ...req.body, userId: req.user!.id });
    res.status(201).json({ address });
  }),
);

router.put(
  "/addresses/:id",
  requireAuth,
  validateBody(addressSchema.partial()),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const address = await req.app.locals.store.updateAddress(id, req.user!.id, req.body);
    if (!address) throw new HttpError(404, "Address not found");
    res.json({ address });
  }),
);

router.delete(
  "/addresses/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const ok = await req.app.locals.store.deleteAddress(Number(req.params.id), req.user!.id);
    if (!ok) throw new HttpError(404, "Address not found");
    res.json({ ok: true });
  }),
);

export default router;
