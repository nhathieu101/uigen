// @vitest-environment node
import { describe, test, expect, vi, beforeEach } from "vitest";
import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode("development-secret-key");

const mockCookieStore = {
  set: vi.fn(),
  get: vi.fn(),
  delete: vi.fn(),
};

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve(mockCookieStore)),
}));

const { createSession, getSession } = await import("@/lib/auth");

describe("createSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-01T00:00:00Z"));
  });

  test("sets a cookie with the correct name and options", async () => {
    await createSession("user-123", "test@example.com");

    expect(mockCookieStore.set).toHaveBeenCalledOnce();
    const [name, , options] = mockCookieStore.set.mock.calls[0];

    expect(name).toBe("auth-token");
    expect(options).toMatchObject({
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
  });

  test("creates a valid JWT token with correct payload", async () => {
    await createSession("user-123", "test@example.com");

    const [, token] = mockCookieStore.set.mock.calls[0];
    const { payload } = await jwtVerify(token, JWT_SECRET);

    expect(payload.userId).toBe("user-123");
    expect(payload.email).toBe("test@example.com");
  });

  test("sets expiration to 7 days from now", async () => {
    await createSession("user-123", "test@example.com");

    const [, token, options] = mockCookieStore.set.mock.calls[0];
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const expectedExpiry = new Date(Date.now() + sevenDaysMs);

    expect(options.expires.getTime()).toBe(expectedExpiry.getTime());

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const tokenExp = payload.exp! * 1000;
    // JWT exp should be within 1 second of expected
    expect(Math.abs(tokenExp - expectedExpiry.getTime())).toBeLessThan(1000);
  });

  test("sets secure flag based on NODE_ENV", async () => {
    await createSession("user-123", "test@example.com");

    const [, , options] = mockCookieStore.set.mock.calls[0];
    expect(options.secure).toBe(process.env.NODE_ENV === "production");
  });
});

async function createToken(
  payload: Record<string, unknown>,
  expiresIn = "7d"
) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expiresIn)
    .setIssuedAt()
    .sign(JWT_SECRET);
}

describe("getSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("returns null when no cookie exists", async () => {
    mockCookieStore.get.mockReturnValue(undefined);

    const session = await getSession();

    expect(session).toBeNull();
    expect(mockCookieStore.get).toHaveBeenCalledWith("auth-token");
  });

  test("returns session payload for a valid token", async () => {
    const token = await createToken({
      userId: "user-123",
      email: "test@example.com",
    });
    mockCookieStore.get.mockReturnValue({ value: token });

    const session = await getSession();

    expect(session).toMatchObject({
      userId: "user-123",
      email: "test@example.com",
    });
  });

  test("returns null for an invalid token", async () => {
    mockCookieStore.get.mockReturnValue({ value: "invalid-token" });

    const session = await getSession();

    expect(session).toBeNull();
  });

  test("returns null for an expired token", async () => {
    const expiredToken = await new SignJWT({
      userId: "user-123",
      email: "test@example.com",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(Math.floor(Date.now() / 1000) - 60)
      .setIssuedAt()
      .sign(JWT_SECRET);
    mockCookieStore.get.mockReturnValue({ value: expiredToken });

    const session = await getSession();

    expect(session).toBeNull();
  });
});
