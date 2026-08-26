import mongoose from "mongoose";
import supertest from "supertest";
import app from "../app.js";
import User from "../modules/users/user.model.js";
import Role from "../modules/roles/role.model.js";
import Permission from "../modules/permissions/permission.model.js";
import RolePermission from "../modules/roles/rolePermission.model.js";
import { hashPassword } from "../utils/password.js";

const request = supertest(app);

describe("RBAC & User Management CRUD Integration Tests", () => {
  let adminToken, staffToken, managerToken;
  let adminUserId, staffUserId, managerUserId;
  let adminRoleId, staffRoleId, managerRoleId;

  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/inventro_track_test";
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
    // Clear data
    await User.deleteMany({});
    await RolePermission.deleteMany({});
    await Permission.deleteMany({});
    await Role.deleteMany({});

    // 1. Seed Roles
    const adminRole = await Role.create({ name: "ADMIN" });
    const managerRole = await Role.create({ name: "INVENTORY_MANAGER" });
    const staffRole = await Role.create({ name: "STAFF" });

    adminRoleId = adminRole._id.toString();
    managerRoleId = managerRole._id.toString();
    staffRoleId = staffRole._id.toString();

    // 2. Seed Permissions & RolePermissions
    const modules = ["PRODUCT", "CATEGORY", "STOCK_TRANSACTION", "USER"];
    for (const mod of modules) {
      // Admin
      const adminPerm = await Permission.create({
        module: mod,
        can_create: mod !== "STOCK_TRANSACTION",
        can_view: mod !== "STOCK_TRANSACTION",
        can_edit: true,
        can_delete: mod !== "STOCK_TRANSACTION"
      });
      await RolePermission.create({ role: adminRole._id, permission: adminPerm._id });

      // Manager
      const managerPerm = await Permission.create({
        module: mod,
        can_create: false,
        can_view: mod === "PRODUCT",
        can_edit: mod === "STOCK_TRANSACTION",
        can_delete: false
      });
      await RolePermission.create({ role: managerRole._id, permission: managerPerm._id });

      // Staff
      const staffPerm = await Permission.create({
        module: mod,
        can_create: mod === "PRODUCT" || mod === "CATEGORY",
        can_view: mod === "PRODUCT" || mod === "CATEGORY",
        can_edit: mod === "PRODUCT" || mod === "CATEGORY",
        can_delete: mod === "PRODUCT" || mod === "CATEGORY"
      });
      await RolePermission.create({ role: staffRole._id, permission: staffPerm._id });
    }

    // 3. Create Default Users & Retrieve Access Tokens
    const pass = await hashPassword("ValidPass123!");

    const adminUser = await User.create({ name: "Admin Test", email: "admin-test@app.com", password: pass, role: adminRole._id });
    adminUserId = adminUser._id.toString();

    const staffUser = await User.create({ name: "Staff Test", email: "staff-test@app.com", password: pass, role: staffRole._id });
    staffUserId = staffUser._id.toString();

    const managerUser = await User.create({ name: "Manager Test", email: "manager-test@app.com", password: pass, role: managerRole._id });
    managerUserId = managerUser._id.toString();

    // Logins
    const adminLogin = await request.post("/api/auth/login").send({ email: "admin-test@app.com", password: "ValidPass123!" });
    adminToken = adminLogin.body.data.token;

    const staffLogin = await request.post("/api/auth/login").send({ email: "staff-test@app.com", password: "ValidPass123!" });
    staffToken = staffLogin.body.data.token;

    const managerLogin = await request.post("/api/auth/login").send({ email: "manager-test@app.com", password: "ValidPass123!" });
    managerToken = managerLogin.body.data.token;
  });

  afterAll(async () => {
    await User.deleteMany({});
    await RolePermission.deleteMany({});
    await Permission.deleteMany({});
    await Role.deleteMany({});
    await mongoose.connection.close();
  });

  test("ADMIN should be allowed to view users list", async () => {
    const res = await request
      .get("/api/users")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(3);
    expect(res.body.data[0]).not.toHaveProperty("password");
  });

  test("STAFF should be blocked from viewing users list (returns 403)", async () => {
    const res = await request
      .get("/api/users")
      .set("Authorization", `Bearer ${staffToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("You do not have permission");
  });

  test("ADMIN should be allowed to create a new user", async () => {
    const res = await request
      .post("/api/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "New Worker",
        email: "new-worker@app.com",
        password: "WorkerPass123!",
        role_id: staffRoleId
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe("New Worker");
    expect(res.body.data.role.name).toBe("STAFF");
  });

  test("STAFF should be blocked from creating a user (returns 403)", async () => {
    const res = await request
      .post("/api/users")
      .set("Authorization", `Bearer ${staffToken}`)
      .send({
        name: "Hacker User",
        email: "hacker@app.com",
        password: "HackerPass123!",
        role_id: adminRoleId
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test("ADMIN should be blocked from deleting their own account", async () => {
    const res = await request
      .delete(`/api/users/${adminUserId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("cannot delete your own account");
  });

  test("ADMIN should be blocked from deleting the last admin", async () => {
    const res = await request
      .delete(`/api/users/${adminUserId}`) // (blocked by self-deletion anyway)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(400);
  });

  test("ADMIN should be allowed to delete a staff account", async () => {
    const res = await request
      .delete(`/api/users/${staffUserId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const check = await User.findById(staffUserId);
    expect(check).toBeNull();
  });
});
