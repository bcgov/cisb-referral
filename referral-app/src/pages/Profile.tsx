import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "@bcgov/design-system-react-components";
import { useProfile, useUpdateProfile } from "../hooks";
import "./Profile.css";

interface ProfileFormData {
  phone: string;
}

export const Profile = (): React.JSX.Element => {
  const navigate = useNavigate();
  const { profile, isProfileComplete, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    values: {
      phone: profile?.phone ?? "",
    },
  });

  const onSubmit = (data: ProfileFormData): void => {
    updateProfile.mutate(
      { phone: data.phone.trim() },
      {
        onSuccess: () => {
          if (!isProfileComplete) {
            navigate("/");
          }
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="profile-container">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <h1>My Profile</h1>

      {!isProfileComplete && (
        <div className="profile-alert">
          Please complete your profile to continue.
        </div>
      )}

      {updateProfile.isError && (
        <div className="profile-error">Failed to save profile</div>
      )}

      <form className="profile-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="profile-field">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            value={profile?.fullName ?? ""}
            disabled
          />
        </div>

        <div className="profile-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={profile?.email ?? ""}
            disabled
          />
        </div>

        <div className="profile-field">
          <label htmlFor="phone">
            Phone <span className="required">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            placeholder="Enter your phone number"
            aria-invalid={errors.phone ? "true" : "false"}
            {...register("phone", { required: "Phone is required" })}
          />
          {errors.phone && (
            <span className="field-error">{errors.phone.message}</span>
          )}
        </div>

        <div className="profile-actions">
          <Button
            type="submit"
            variant="primary"
            isDisabled={updateProfile.isPending}
          >
            {updateProfile.isPending ? "Saving..." : "Save Profile"}
          </Button>

          {isProfileComplete && (
            <Button variant="secondary" onPress={() => navigate("/")}>
              Back to Home
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};
