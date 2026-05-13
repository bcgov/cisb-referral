import { describe, expect, it } from "vitest";
import { referralSchema } from "../../schemas/referralSchema";

const validBaseData = {
  referredBy: "SDPR_INTERNAL",
  referrerContactName: "Jordan Smith",
  referrerEmail: "jordan.smith@example.com",
  referrerPhone: "2505551234",
  individualFirstName: "Casey",
  regionId: "a1b2c3d4-e5f6-4a90-8bcd-ef1234567890",
  specificCityTown: "100 Mile House",
  experiencingHomelessness: "YES",
  currentlyConnectedSupports: [],
  neededSupports: [],
};

describe("referralSchema human-friendly validation messages", () => {
  it("shows readable required-field messages instead of technical parser errors", () => {
    const result = referralSchema.safeParse({
      referredBy: "SDPR_INTERNAL",
      currentlyConnectedSupports: [],
      neededSupports: [],
      experiencingHomelessness: "YES",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      expect(messages).toContain("Please enter contact name");
      expect(messages).toContain("Please enter an email address");
      expect(messages).toContain("Please enter a phone number");
      expect(messages).toContain("Please enter first name");
      expect(messages).toContain("Please select a region");
      expect(messages).toContain("Please enter the current city or town");
      expect(
        messages.some((message) => message.includes("Invalid input")),
      ).toBe(false);
    }
  });

  it("rejects numbers in name fields with clear messages", () => {
    const result = referralSchema.safeParse({
      ...validBaseData,
      referrerContactName: "Jordan2",
      individualFirstName: "Casey7",
      individualLastName: "Smith3",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      expect(messages).toContain("Contact name cannot include numbers");
      expect(messages).toContain("First name cannot include numbers");
      expect(messages).toContain("Last name cannot include numbers");
    }
  });

  it("enforces backend-aligned max length for required name fields", () => {
    const result = referralSchema.safeParse({
      ...validBaseData,
      referrerContactName: "a".repeat(201),
      individualFirstName: "a".repeat(101),
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      expect(messages).toContain(
        "Contact name must be 200 characters or fewer",
      );
      expect(messages).toContain("First name must be 100 characters or fewer");
    }
  });

  it("enforces backend-aligned max length for optional name fields", () => {
    const result = referralSchema.safeParse({
      ...validBaseData,
      individualMiddleName: "a".repeat(101),
      individualLastName: "a".repeat(101),
      individualPreferredName: "a".repeat(101),
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      expect(messages).toContain("Middle name must be 100 characters or fewer");
      expect(messages).toContain("Last name must be 100 characters or fewer");
      expect(messages).toContain(
        "Preferred name must be 100 characters or fewer",
      );
    }
  });

  it("accepts optional name fields when left blank", () => {
    const result = referralSchema.safeParse({
      ...validBaseData,
      individualMiddleName: "",
      individualLastName: "   ",
      individualPreferredName: "  Alex  ",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.individualMiddleName).toBeUndefined();
      expect(result.data.individualLastName).toBeUndefined();
      expect(result.data.individualPreferredName).toBe("Alex");
    }
  });

  it("normalizes optional individual phone when left blank", () => {
    const result = referralSchema.safeParse({
      ...validBaseData,
      individualPhone: "   ",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.individualPhone).toBeUndefined();
    }
  });

  it("shows a clear message when referrer phone is missing", () => {
    const result = referralSchema.safeParse({
      ...validBaseData,
      referrerPhone: "",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      expect(messages).toContain("Please enter a phone number");
    }
  });

  it("shows a clear message for invalid individual phone format", () => {
    const result = referralSchema.safeParse({
      ...validBaseData,
      individualPhone: "12345",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      expect(messages).toContain("Please enter a valid 10-digit phone number");
    }
  });

  it("shows partner agency conditional errors from schema even when other required fields are missing", () => {
    const result = referralSchema.safeParse({
      referredBy: "PARTNER_AGENCY",
      partnerAgencyName: "   ",
      agencyTypeId: "",
      referrerContactName: "",
      referrerEmail: "",
      referrerPhone: "",
      individualFirstName: "",
      regionId: "",
      specificCityTown: "",
      experiencingHomelessness: "",
      currentlyConnectedSupports: [],
      neededSupports: [],
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      expect(messages).toContain("Please enter the partner agency name");
      expect(messages).toContain("Please select the type of agency");
    }
  });

  it("rejects letters in referrer phone number", () => {
    const result = referralSchema.safeParse({
      ...validBaseData,
      referrerPhone: "1111111113llll",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      expect(messages).toContain("Please enter a valid 10-digit phone number");
    }
  });

  it("rejects letters in individual phone number", () => {
    const result = referralSchema.safeParse({
      ...validBaseData,
      individualPhone: "1111111113llll",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      expect(messages).toContain("Please enter a valid 10-digit phone number");
    }
  });

  it("enforces backend-aligned max length for bestWayToReach (200)", () => {
    const result = referralSchema.safeParse({
      ...validBaseData,
      bestWayToReach: "a".repeat(201),
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      expect(messages).toContain("Please use 200 characters or fewer");
    }
  });

  it("enforces backend-aligned max length for secondaryContact (200)", () => {
    const result = referralSchema.safeParse({
      ...validBaseData,
      secondaryContact: "a".repeat(201),
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      expect(messages).toContain(
        "Secondary contact must be 200 characters or fewer",
      );
    }
  });

  it("allows referralReason up to 5000 characters and rejects 5001", () => {
    const validResult = referralSchema.safeParse({
      ...validBaseData,
      referralReason: "a".repeat(5000),
    });
    expect(validResult.success).toBe(true);

    const invalidResult = referralSchema.safeParse({
      ...validBaseData,
      referralReason: "a".repeat(5001),
    });
    expect(invalidResult.success).toBe(false);

    if (!invalidResult.success) {
      const messages = invalidResult.error.issues.map((issue) => issue.message);
      expect(messages).toContain("Please use 5,000 characters or fewer");
    }
  });
});
