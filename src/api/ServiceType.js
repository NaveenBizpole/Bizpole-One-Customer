export const getPackagesByServiceType = async (serviceTypeId) => {
  try {
    const response = await axiosInstance.post("/getPackagesByServiceType", { serviceTypeId });
    // Always return an array of packages, each with a 'services' array
    let packages = response.data.data;
    if (!Array.isArray(packages)) {
      if (packages && Array.isArray(packages.data)) {
        packages = packages.data;
      } else if (packages && Array.isArray(packages.packages)) {
        packages = packages.packages;
      } else if (packages && packages.data && Array.isArray(packages.data.packages)) {
        packages = packages.data.packages;
      } else {
        packages = [];
      }
    }
    // Ensure every package has a 'services' array
    packages = packages.map(pkg => ({
      ...pkg,
      services: Array.isArray(pkg.services) ? pkg.services : [],
    }));
    return packages;
  } catch (error) {
    console.error("Error fetching packages by service type:", error);
    throw error;
  }
};

import axiosInstance from "./axiosInstance";

export const getAllServiceTypes = async () => {
  try {
    const response = await axiosInstance.get("/listServiceTypes");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching service types:", error);
    throw error;
  }
};
