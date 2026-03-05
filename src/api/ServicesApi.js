import axiosInstance from "./axiosInstance";

// ✅ Fetch all paginated service names
export const getServices = async ({ page = 1, limit = 10, filter = "", categoryId = "" } = {}) => {
  const params = { page, limit };
  if (filter) params.filter = filter;
  if (categoryId) params.categoryId = categoryId;

  const res = await axiosInstance.get("/service-names", { params });
  return res.data;
};

// ✅ Fetch services for a specific category
export const getServicesByCategory = async (categoryId, { page = 1, limit = 2 } = {}) => {
  console.log({ categoryId });

  if (!categoryId) return { data: [], total: 0 };
  const params = { page, limit };

  const res = await axiosInstance.get(`/service-categories/${categoryId}`, { params });
  if (res.data?.data) {
    const { Services, pagination } = res.data.data;
    return {
      data: Services || [],
      total: pagination?.total || (Services ? Services.length : 0)
    };
  }
  return { data: [], total: 0 };
};

// ✅ Fetch service categories
export const getServiceCategories = async () => {
  const res = await axiosInstance.get("/service-category");
  return res.data;
};

// ✅ Fetch single service details (basic info)
export const getServiceById = async ({ ServiceId }) => {
  const res = await axiosInstance.post("/filterServices", { ServiceId });
  return res.data;
};

// ✅ Fetch all service prices for a state, and filter exact service price
export const getServicePrice = async ({ ServiceId, StateId, StateName }) => {
  try {
    if (!StateId && !StateName) {
      throw new Error("StateID or StateName is required.");
    }

    // Fetch all services price for that state
    const res = await axiosInstance.post("/filterServices", { StateId, StateName });
    const allPrices = res.data?.data || [];

    // Find the matching service price
    const matchedService = allPrices.find(
      (service) => String(service.ServiceID) === String(ServiceId)
    );

    return {
      success: true,
      data: matchedService || null,
      allPrices,
    };
  } catch (err) {
    console.error("Error fetching service price:", err);
    return { success: false, message: err.message };
  }
};

// ✅ Fetch service packages
export const getServicePackages = async () => {
  const res = await axiosInstance.get("/getPackage");
  return res.data;
};

// Fetch price and currency for a service and state (GET, params: StateName, ServiceID)
export const getServicePriceCurrency = async ({ StateName, ServiceID }) => {
  try {
    const res = await axiosInstance.get("/service-price-currency", {
      params: { StateName, ServiceID }
    });
    return res.data;
  } catch (err) {
    console.error("Error fetching service price/currency:", err);
    return { success: false, message: err.message };
  }
};

export default {
  getServices,
  getServiceCategories,
  getServicesByCategory,
  getServiceById,
  getServicePrice,
  getServicePackages,
  getServicePriceCurrency,
};
