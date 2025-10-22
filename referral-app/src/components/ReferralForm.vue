<script setup lang="ts">
import { computed } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import Multiselect from "@vueform/multiselect";
import "@vueform/multiselect/themes/default.css";
import {
  referralSchema,
  getReferralFlags,
  type ReferralFormData,
  ReferredByType,
  MinistryName,
  AgencyType,
  RegionType,
  ReleaseFromType,
  SupportType,
} from "../schemas/referralSchema";

const { handleSubmit, defineField, errors } = useForm({
  validationSchema: toTypedSchema(referralSchema),
  initialValues: {
    currentlyConnectedSupports: [],
    neededSupports: [],
    pendingRelease: "No",
    currentlyHomeless: "Unknown",
  },
});

const [referredBy, referredByAttrs] = defineField("referredBy");
const [referrerContactName, referrerContactNameAttrs] = defineField(
  "referrerContactName"
);
const [referrerPhone, referrerPhoneAttrs] = defineField("referrerPhone");
const [referrerEmail, referrerEmailAttrs] = defineField("referrerEmail");
const [ministryName, ministryNameAttrs] = defineField("ministryName");
const [ministryNameOther, ministryNameOtherAttrs] =
  defineField("ministryNameOther");
const [programArea, programAreaAttrs] = defineField("programArea");
const [partnerAgencyName, partnerAgencyNameAttrs] =
  defineField("partnerAgencyName");
const [agencyType, agencyTypeAttrs] = defineField("agencyType");
const [agencyTypeOther, agencyTypeOtherAttrs] = defineField("agencyTypeOther");
const [personId, personIdAttrs] = defineField("personId");
const [individualFirstName, individualFirstNameAttrs] = defineField(
  "individualFirstName"
);
const [individualMiddleName, individualMiddleNameAttrs] = defineField(
  "individualMiddleName"
);
const [individualLastName, individualLastNameAttrs] =
  defineField("individualLastName");
const [individualPreferredName, individualPreferredNameAttrs] = defineField(
  "individualPreferredName"
);
const [gainFile, gainFileAttrs] = defineField("gainFile");
const [individualPhone, individualPhoneAttrs] = defineField("individualPhone");
const [individualDateOfBirth, individualDateOfBirthAttrs] = defineField(
  "individualDateOfBirth"
);
const [currentRegion, currentRegionAttrs] = defineField("currentRegion");
const [specificCityTown, specificCityTownAttrs] =
  defineField("specificCityTown");
const [secondaryContact, secondaryContactAttrs] =
  defineField("secondaryContact");
const [bestWayToReach, bestWayToReachAttrs] = defineField("bestWayToReach");
const [currentlyHomeless, currentlyHomelessAttrs] =
  defineField("currentlyHomeless");
const [pendingRelease, pendingReleaseAttrs] = defineField("pendingRelease");
const [currentlyConnectedSupports, currentlyConnectedSupportsAttrs] =
  defineField("currentlyConnectedSupports");
const [currentlyConnectedSupportsOther, currentlyConnectedSupportsOtherAttrs] =
  defineField("currentlyConnectedSupportsOther");
const [neededSupports, neededSupportsAttrs] = defineField("neededSupports");
const [neededSupportsOther, neededSupportsOtherAttrs] = defineField(
  "neededSupportsOther"
);
const [referralSummary, referralSummaryAttrs] = defineField("referralSummary");

const showMinistryFields = computed(
  () => referredBy.value === "Partner Ministry"
);
const showAgencyFields = computed(() => referredBy.value === "Partner Agency");
const showSDPRField = computed(() => referredBy.value === "SDPR Internal");
const showMinistryOther = computed(() => ministryName.value === "Other");
const showAgencyOther = computed(() => agencyType.value === "Other");
const showCurrentSupportsOther = computed(() =>
  currentlyConnectedSupports.value?.includes("Others" as any)
);
const showNeededSupportsOther = computed(() =>
  neededSupports.value?.includes("Others" as any)
);

const onSubmit = handleSubmit((formValues: ReferralFormData) => {
  const flags = getReferralFlags(formValues);
  console.log("Form submitted:", formValues);
  console.log("Flags:", flags);
  alert(`Form submitted!\nFlags: ${flags.join(", ")}`);
});
</script>

<template>
  <div>
    <h1>CISB Referral Form</h1>
    <form @submit="onSubmit">
      <section>
        <h2>Referral Details</h2>
        <div>
          <label for="referredBy">Referred by (Required) *</label>
          <select id="referredBy" v-model="referredBy" v-bind="referredByAttrs">
            <option value="">Select</option>
            <option
              v-for="opt in ReferredByType.options"
              :key="opt"
              :value="opt"
            >
              {{ opt }}
            </option>
          </select>
          <span v-if="errors.referredBy">{{ errors.referredBy }}</span>
        </div>
        <template v-if="showMinistryFields">
          <div>
            <label for="ministryName">Name of Ministry *</label>
            <select
              id="ministryName"
              v-model="ministryName"
              v-bind="ministryNameAttrs"
            >
              <option value="">Select</option>
              <option
                v-for="opt in MinistryName.options"
                :key="opt"
                :value="opt"
              >
                {{ opt }}
              </option>
            </select>
            <span v-if="errors.ministryName">{{ errors.ministryName }}</span>
          </div>
          <div v-if="showMinistryOther">
            <label for="ministryNameOther">Specify Ministry *</label>
            <input
              id="ministryNameOther"
              v-model="ministryNameOther"
              v-bind="ministryNameOtherAttrs"
              type="text"
            />
            <span v-if="errors.ministryNameOther">{{
              errors.ministryNameOther
            }}</span>
          </div>
          <div>
            <label for="programArea">Program Area</label>
            <input
              id="programArea"
              v-model="programArea"
              v-bind="programAreaAttrs"
              type="text"
            />
          </div>
        </template>
        <template v-if="showAgencyFields">
          <div>
            <label for="partnerAgencyName">Partner Agency Name *</label>
            <input
              id="partnerAgencyName"
              v-model="partnerAgencyName"
              v-bind="partnerAgencyNameAttrs"
              type="text"
            />
            <span v-if="errors.partnerAgencyName">{{
              errors.partnerAgencyName
            }}</span>
          </div>
          <div>
            <label for="agencyType">Type of Agency</label>
            <select
              id="agencyType"
              v-model="agencyType"
              v-bind="agencyTypeAttrs"
            >
              <option value="">Select</option>
              <option v-for="opt in AgencyType.options" :key="opt" :value="opt">
                {{ opt }}
              </option>
            </select>
          </div>
          <div v-if="showAgencyOther">
            <label for="agencyTypeOther">Specify Agency Type *</label>
            <input
              id="agencyTypeOther"
              v-model="agencyTypeOther"
              v-bind="agencyTypeOtherAttrs"
              type="text"
            />
            <span v-if="errors.agencyTypeOther">{{
              errors.agencyTypeOther
            }}</span>
          </div>
        </template>
        <div v-if="showSDPRField">
          <label for="personId">Person ID</label>
          <input
            id="personId"
            v-model="personId"
            v-bind="personIdAttrs"
            type="text"
          />
        </div>
        <div>
          <label for="referrerContactName">Full Name (Required) *</label>
          <input
            id="referrerContactName"
            v-model="referrerContactName"
            v-bind="referrerContactNameAttrs"
            type="text"
          />
          <span v-if="errors.referrerContactName">{{
            errors.referrerContactName
          }}</span>
        </div>
        <div class="row">
          <div>
            <label for="referrerPhone">Phone Number (Required) *</label>
            <input
              id="referrerPhone"
              v-model="referrerPhone"
              v-bind="referrerPhoneAttrs"
              type="tel"
            />
            <span v-if="errors.referrerPhone">{{ errors.referrerPhone }}</span>
          </div>
          <div>
            <label for="referrerEmail">Email (Required) *</label>
            <input
              id="referrerEmail"
              v-model="referrerEmail"
              v-bind="referrerEmailAttrs"
              type="email"
            />
            <span v-if="errors.referrerEmail">{{ errors.referrerEmail }}</span>
          </div>
        </div>
      </section>
      <section>
        <h2>Individual's Info</h2>
        <div class="row">
          <div>
            <label for="individualFirstName">First Name (Required) *</label>
            <input
              id="individualFirstName"
              v-model="individualFirstName"
              v-bind="individualFirstNameAttrs"
              type="text"
            />
            <span v-if="errors.individualFirstName">{{
              errors.individualFirstName
            }}</span>
          </div>
          <div>
            <label for="individualMiddleName">Middle Name (Optional)</label>
            <input
              id="individualMiddleName"
              v-model="individualMiddleName"
              v-bind="individualMiddleNameAttrs"
              type="text"
            />
          </div>
        </div>
        <div class="row">
          <div>
            <label for="individualLastName">Last Name (Optional)</label>
            <input
              id="individualLastName"
              v-model="individualLastName"
              v-bind="individualLastNameAttrs"
              type="text"
            />
          </div>
          <div>
            <label for="individualPreferredName"
              >Preferred Name (Optional)</label
            >
            <input
              id="individualPreferredName"
              v-model="individualPreferredName"
              v-bind="individualPreferredNameAttrs"
              type="text"
            />
          </div>
        </div>
        <div>
          <label for="gainFile">GAIN File (SA) (Optional)</label>
          <input
            id="gainFile"
            v-model="gainFile"
            v-bind="gainFileAttrs"
            type="text"
          />
        </div>
        <div class="row">
          <div>
            <label for="individualPhone">Phone Number (Optional)</label>
            <input
              id="individualPhone"
              v-model="individualPhone"
              v-bind="individualPhoneAttrs"
              type="tel"
            />
          </div>
          <div>
            <label for="individualDateOfBirth">Date of Birth (Optional)</label>
            <input
              id="individualDateOfBirth"
              v-model="individualDateOfBirth"
              v-bind="individualDateOfBirthAttrs"
              type="date"
            />
          </div>
        </div>
        <div class="row">
          <div>
            <label for="currentRegion">Current Region (Required) *</label>
            <select
              id="currentRegion"
              v-model="currentRegion"
              v-bind="currentRegionAttrs"
            >
              <option value="">Select</option>
              <option v-for="opt in RegionType.options" :key="opt" :value="opt">
                {{ opt }}
              </option>
            </select>
            <span v-if="errors.currentRegion">{{ errors.currentRegion }}</span>
          </div>
          <div>
            <label for="specificCityTown">Current City (Required) *</label>
            <input
              id="specificCityTown"
              v-model="specificCityTown"
              v-bind="specificCityTownAttrs"
              type="text"
            />
            <span v-if="errors.specificCityTown">{{
              errors.specificCityTown
            }}</span>
          </div>
        </div>
        <div>
          <label for="secondaryContact"
            >Is there a secondary contact? (Optional)</label
          >
          <input
            id="secondaryContact"
            v-model="secondaryContact"
            v-bind="secondaryContactAttrs"
            type="text"
          />
        </div>
        <div>
          <label for="bestWayToReach"
            >Best way to reach the individual (Optional)</label
          >
          <textarea
            id="bestWayToReach"
            v-model="bestWayToReach"
            v-bind="bestWayToReachAttrs"
            rows="4"
          ></textarea>
        </div>
        <div>
          <label
            >Are they currently experiencing homelessness? (Required) *</label
          >
          <div class="radio-group">
            <label
              ><input
                type="radio"
                value="Yes"
                v-model="currentlyHomeless"
                v-bind="currentlyHomelessAttrs"
              />
              Yes</label
            >
            <label
              ><input
                type="radio"
                value="No"
                v-model="currentlyHomeless"
                v-bind="currentlyHomelessAttrs"
              />
              No</label
            >
            <label
              ><input
                type="radio"
                value="Unknown"
                v-model="currentlyHomeless"
                v-bind="currentlyHomelessAttrs"
              />
              Unknown</label
            >
          </div>
          <span v-if="errors.currentlyHomeless">{{
            errors.currentlyHomeless
          }}</span>
        </div>
        <div>
          <label for="pendingRelease"
            >Are they pending release or recently released from any of the
            following? (Optional)</label
          >
          <select
            id="pendingRelease"
            v-model="pendingRelease"
            v-bind="pendingReleaseAttrs"
          >
            <option value="">Select</option>
            <option
              v-for="opt in ReleaseFromType.options"
              :key="opt"
              :value="opt"
            >
              {{ opt }}
            </option>
          </select>
        </div>
        <div>
          <label for="currentlyConnectedSupports"
            >Which supports are they currently connected with? (Optional)</label
          >
          <Multiselect
            id="currentlyConnectedSupports"
            v-model="currentlyConnectedSupports"
            v-bind="currentlyConnectedSupportsAttrs"
            :options="SupportType.options"
            mode="tags"
            :searchable="true"
            :close-on-select="false"
            placeholder="Select or search options"
          />
        </div>
        <div v-if="showCurrentSupportsOther">
          <label for="currentlyConnectedSupportsOther"
            >Specify Other Supports *</label
          >
          <input
            id="currentlyConnectedSupportsOther"
            v-model="currentlyConnectedSupportsOther"
            v-bind="currentlyConnectedSupportsOtherAttrs"
            type="text"
          />
        </div>
        <div>
          <label for="neededSupports"
            >Which supports do they need? (Optional)</label
          >
          <Multiselect
            id="neededSupports"
            v-model="neededSupports"
            v-bind="neededSupportsAttrs"
            :options="SupportType.options"
            mode="tags"
            :searchable="true"
            :close-on-select="false"
            placeholder="Select or search options"
          />
        </div>
        <div v-if="showNeededSupportsOther">
          <label for="neededSupportsOther"
            >Specify Other Supports Needed *</label
          >
          <input
            id="neededSupportsOther"
            v-model="neededSupportsOther"
            v-bind="neededSupportsOtherAttrs"
            type="text"
          />
        </div>
        <div>
          <label for="referralSummary"
            >Brief summary of the reason for referral (Optional)</label
          >
          <textarea
            id="referralSummary"
            v-model="referralSummary"
            v-bind="referralSummaryAttrs"
            rows="6"
          ></textarea>
        </div>
      </section>
      <button type="submit">Submit</button>
    </form>
  </div>
</template>
