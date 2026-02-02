import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "@bcgov/design-system-react-components";
import { useProfile, useUpdateProfile } from "../hooks";
import "./Profile.css";

interface ProfileFormData {
  telephone: string;
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
      telephone: profile?.telephone ?? "",
    },
  });

  const onSubmit = (data: ProfileFormData): void => {
    updateProfile.mutate(
      { telephone: data.telephone.trim() },
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
          Please complete your profile to continue. A telephone number is
          required before you can submit referrals.
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
            value={`${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim()}
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
          <label htmlFor="telephone">
            Telephone <span className="required">*</span>
          </label>
          <input
            id="telephone"
            type="tel"
            placeholder="Enter your telephone number"
            aria-invalid={errors.telephone ? "true" : "false"}
            {...register("telephone", { required: "Telephone is required" })}
          />
          {errors.telephone && (
            <span className="field-error">{errors.telephone.message}</span>
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
