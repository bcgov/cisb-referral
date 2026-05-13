import type { ReactNode } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const { mockUseLookupData, mockUseProfile, mockCreateReferral, mockNavigate } =
  vi.hoisted(() => ({
    mockUseLookupData: vi.fn(),
    mockUseProfile: vi.fn(),
    mockCreateReferral: vi.fn(),
    mockNavigate: vi.fn(),
  }));

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("@bcgov/design-system-react-components", () => ({
  Button: ({
    children,
    isDisabled,
    ...props
  }: {
    children: ReactNode;
    isDisabled?: boolean;
    type?: "button" | "submit" | "reset";
  }) => (
    <button {...props} disabled={isDisabled}>
      {children}
    </button>
  ),
}));

vi.mock("../../hooks", () => ({
  useLookupData: () => mockUseLookupData(),
  useProfile: () => mockUseProfile(),
}));

vi.mock("../../services", () => ({
  apiService: {
    createReferral: (data: Record<string, unknown>) => mockCreateReferral(data),
  },
}));

vi.mock("../../components/sections", async () => {
  const { useController, useWatch } = await import("react-hook-form");
  const { isOtherLookupOption } = await import("../../utils/formHelpers");

  interface BaseFieldProps {
    readonly name: string;
    readonly label: string;
    readonly control: unknown;
  }

  interface TextInputProps extends BaseFieldProps {
    readonly type?: "text" | "email" | "tel";
  }

  interface SelectOption {
    readonly id: string;
    readonly name: string;
  }

  interface SelectFieldProps extends BaseFieldProps {
    readonly options: SelectOption[];
  }

  function TextInput({
    name,
    label,
    control,
    type = "text",
  }: Readonly<TextInputProps>) {
    const {
      field,
      fieldState: { error },
    } = useController({
      name,
      control: control as never,
    });

    return (
      <div>
        <label htmlFor={name}>{label}</label>
        <input
          id={name}
          aria-label={label}
          type={type}
          value={(field.value as string | undefined) ?? ""}
          onChange={(event) => field.onChange(event.target.value)}
          onBlur={field.onBlur}
        />
        {typeof error?.message === "string" && <span>{error.message}</span>}
      </div>
    );
  }

  function SelectField({
    name,
    label,
    control,
    options,
  }: Readonly<SelectFieldProps>) {
    const {
      field,
      fieldState: { error },
    } = useController({
      name,
      control: control as never,
    });

    return (
      <div>
        <label htmlFor={name}>{label}</label>
        <select
          id={name}
          aria-label={label}
          value={(field.value as string | undefined) ?? ""}
          onChange={(event) => field.onChange(event.target.value)}
          onBlur={field.onBlur}
        >
          <option value="">Select...</option>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
        {typeof error?.message === "string" && <span>{error.message}</span>}
      </div>
    );
  }

  function ReferralDetailsSection({
    form,
    ministries,
    agencyTypes,
  }: {
    readonly form: { control: unknown };
    readonly ministries: SelectOption[];
    readonly agencyTypes: SelectOption[];
  }) {
    const referredBy = useWatch({
      control: form.control as never,
      name: "referredBy",
    }) as string | undefined;

    const agencyTypeId = useWatch({
      control: form.control as never,
      name: "agencyTypeId",
    }) as string | undefined;

    const selectedAgencyType = agencyTypes.find((agencyType) => {
      return agencyType.id === agencyTypeId;
    });
    const isOtherAgencyType = isOtherLookupOption(selectedAgencyType?.name);

    const ministryId = useWatch({
      control: form.control as never,
      name: "ministryId",
    }) as string | undefined;

    const selectedMinistry = ministries.find((ministry) => {
      return ministry.id === ministryId;
    });
    const isOtherMinistry = isOtherLookupOption(selectedMinistry?.name);

    return (
      <section>
        <h2>Referral Details</h2>
        <SelectField
          name="referredBy"
          label="Referred By"
          control={form.control}
          options={[
            { id: "PARTNER_MINISTRY", name: "Partner Ministry" },
            { id: "SDPR_INTERNAL", name: "SDPR Internal" },
            { id: "PARTNER_AGENCY", name: "Partner Agency" },
          ]}
        />

        <TextInput
          name="referrerContactName"
          label="Full Name"
          control={form.control}
        />
        <TextInput
          name="referrerPhone"
          label="Phone Number"
          type="tel"
          control={form.control}
        />
        <TextInput
          name="referrerEmail"
          label="Email"
          type="email"
          control={form.control}
        />

        {referredBy === "PARTNER_MINISTRY" && (
          <>
            <SelectField
              name="ministryId"
              label="Name of Ministry"
              control={form.control}
              options={ministries}
            />
            {isOtherMinistry && (
              <TextInput
                name="ministryNameOther"
                label="Specify Ministry (if not listed)"
                control={form.control}
              />
            )}
          </>
        )}

        {referredBy === "PARTNER_AGENCY" && (
          <>
            <TextInput
              name="partnerAgencyName"
              label="Partner Agency Name"
              control={form.control}
            />
            <SelectField
              name="agencyTypeId"
              label="Type of Agency"
              control={form.control}
              options={agencyTypes}
            />
            {isOtherAgencyType && (
              <TextInput
                name="agencyTypeOther"
                label="Specify Agency Type (if not listed)"
                control={form.control}
              />
            )}
          </>
        )}
      </section>
    );
  }

  function IndividualInfoSection({
    form,
    regions,
  }: {
    readonly form: { control: unknown };
    readonly regions: SelectOption[];
  }) {
    return (
      <section>
        <h2>Individual&apos;s Info</h2>
        <TextInput
          name="individualFirstName"
          label="First Name"
          control={form.control}
        />
        <SelectField
          name="regionId"
          label="Current Region"
          control={form.control}
          options={regions}
        />
        <TextInput
          name="specificCityTown"
          label="Current City"
          control={form.control}
        />
        <SelectField
          name="experiencingHomelessness"
          label="Are they currently experiencing homelessness?"
          control={form.control}
          options={[
            { id: "YES", name: "Yes" },
            { id: "NO", name: "No" },
            { id: "UNKNOWN", name: "Unknown" },
          ]}
        />
      </section>
    );
  }

  function SupportServicesSection() {
    return (
      <section>
        <h2>Support Services</h2>
      </section>
    );
  }

  return {
    ReferralDetailsSection,
    IndividualInfoSection,
    SupportServicesSection,
  };
});

import { ReferralForm } from "../../components/ReferralForm";

const defaultLookupData = {
  regions: [
    {
      id: "11111111-1111-4111-8111-111111111111",
      name: "Region 1",
      active: true,
    },
  ],
  ministries: [
    {
      id: "22222222-2222-4222-8222-222222222222",
      name: "Ministry 1",
      active: true,
    },
  ],
  agencyTypes: [
    {
      id: "33333333-3333-4333-8333-333333333333",
      name: "Agency Type 1",
      active: true,
    },
  ],
  isLoading: false,
  error: null,
};

const defaultProfile = {
  profile: {
    fullName: "Jordan Smith",
    email: "jordan.smith@example.com",
    phone: "2505551234",
  },
};

function fillMinimumRequiredIndividualFields() {
  fireEvent.change(screen.getByLabelText("First Name"), {
    target: { value: "Casey" },
  });
  fireEvent.change(screen.getByLabelText("Current Region"), {
    target: { value: "11111111-1111-4111-8111-111111111111" },
  });
  fireEvent.change(screen.getByLabelText("Current City"), {
    target: { value: "Victoria" },
  });
  fireEvent.change(
    screen.getByLabelText("Are they currently experiencing homelessness?"),
    {
      target: { value: "YES" },
    },
  );
}

describe("ReferralForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseLookupData.mockReturnValue(defaultLookupData);
    mockUseProfile.mockReturnValue(defaultProfile);
    mockCreateReferral.mockResolvedValue({ id: "ref-123" });
  });

  it("shows loading state while lookup data is loading", () => {
    // Arrange
    mockUseLookupData.mockReturnValue({
      ...defaultLookupData,
      isLoading: true,
    });

    // Act
    render(<ReferralForm />);

    // Assert
    expect(screen.getByText("Loading form...")).toBeInTheDocument();
  });

  it("shows error state when lookup data fails", () => {
    // Arrange
    mockUseLookupData.mockReturnValue({
      ...defaultLookupData,
      error: new Error("Lookup failed"),
    });

    // Act
    render(<ReferralForm />);

    // Assert
    expect(
      screen.getByText("Error loading form data. Please try again later."),
    ).toBeInTheDocument();
  });

  it("shows partner agency conditional errors on submit", async () => {
    // Arrange
    render(<ReferralForm />);

    fireEvent.change(screen.getByLabelText("Referred By"), {
      target: { value: "PARTNER_AGENCY" },
    });

    // Act
    fireEvent.click(screen.getByRole("button", { name: "Submit Referral" }));

    // Assert
    expect(
      await screen.findByText("Please enter the partner agency name"),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Please select the type of agency"),
    ).toBeInTheDocument();
    expect(mockCreateReferral).not.toHaveBeenCalled();
  });

  it("blocks submit when Other ministry is selected without details", async () => {
    // Arrange
    mockUseLookupData.mockReturnValue({
      ...defaultLookupData,
      ministries: [
        {
          id: "22222222-2222-4222-8222-222222222223",
          name: "Other",
          active: true,
        },
      ],
    });

    render(<ReferralForm />);

    fireEvent.change(screen.getByLabelText("Referred By"), {
      target: { value: "PARTNER_MINISTRY" },
    });
    fireEvent.change(screen.getByLabelText("Name of Ministry"), {
      target: { value: "22222222-2222-4222-8222-222222222223" },
    });
    fillMinimumRequiredIndividualFields();

    // Act
    fireEvent.click(screen.getByRole("button", { name: "Submit Referral" }));

    // Assert
    expect(
      await screen.findByText("Please specify the ministry name"),
    ).toBeInTheDocument();
    expect(mockCreateReferral).not.toHaveBeenCalled();
  });

  it("blocks submit when Other agency type is selected without details", async () => {
    // Arrange
    mockUseLookupData.mockReturnValue({
      ...defaultLookupData,
      agencyTypes: [
        {
          id: "33333333-3333-4333-8333-333333333334",
          name: "Other",
          active: true,
        },
      ],
    });

    render(<ReferralForm />);

    fireEvent.change(screen.getByLabelText("Referred By"), {
      target: { value: "PARTNER_AGENCY" },
    });
    fireEvent.change(screen.getByLabelText("Partner Agency Name"), {
      target: { value: "Community Agency" },
    });
    fireEvent.change(screen.getByLabelText("Type of Agency"), {
      target: { value: "33333333-3333-4333-8333-333333333334" },
    });
    fillMinimumRequiredIndividualFields();

    // Act
    fireEvent.click(screen.getByRole("button", { name: "Submit Referral" }));

    // Assert
    expect(
      await screen.findByText("Please specify the agency type"),
    ).toBeInTheDocument();
    expect(mockCreateReferral).not.toHaveBeenCalled();
  });

  it("shows phone error only after submit for invalid referrer phone", async () => {
    // Arrange
    render(<ReferralForm />);

    fireEvent.change(screen.getByLabelText("Referred By"), {
      target: { value: "SDPR_INTERNAL" },
    });
    fillMinimumRequiredIndividualFields();

    fireEvent.change(screen.getByLabelText("Phone Number"), {
      target: { value: "1111111113llll" },
    });

    // Assert (before submit)
    expect(
      screen.queryByText("Please enter a valid 10-digit phone number"),
    ).not.toBeInTheDocument();

    // Act
    fireEvent.click(screen.getByRole("button", { name: "Submit Referral" }));

    // Assert (after submit)
    expect(
      await screen.findByText("Please enter a valid 10-digit phone number"),
    ).toBeInTheDocument();
    expect(mockCreateReferral).not.toHaveBeenCalled();
  });

  it("submits successfully and navigates to the success page", async () => {
    // Arrange
    render(<ReferralForm />);

    fireEvent.change(screen.getByLabelText("Referred By"), {
      target: { value: "SDPR_INTERNAL" },
    });
    fillMinimumRequiredIndividualFields();

    // Act
    fireEvent.click(screen.getByRole("button", { name: "Submit Referral" }));

    // Assert
    await waitFor(() => {
      expect(mockCreateReferral).toHaveBeenCalledTimes(1);
    });
    expect(mockNavigate).toHaveBeenCalledWith("/success?ref=ref-123");
  });
});
