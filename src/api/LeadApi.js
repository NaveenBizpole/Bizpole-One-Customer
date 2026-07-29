import axiosInstance from "./axiosInstance";

/**
 * Create a Lead (customer-portal call-back request, new user + new service).
 * @param {Object} payload - { name, state, mobile, email, proposed_service, preferred_language, lead_source, franchiseeId, employeeId }
 */
export const createLead = async (payload) => {
  const res = await axiosInstance.post("/lead-generation/createLead", payload);
  return res.data;
};

/**
 * Schedule a follow-up on a Lead.
 * @param {Object} payload - { leadId, followUpDate, remark }
 */
export const createLeadFollowUp = async ({ leadId, followUpDate, remark }) => {
  const res = await axiosInstance.post("/followup/create", { leadId, followUpDate, remark });
  return res.data;
};
