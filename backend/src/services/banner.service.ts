import Banner from "../models/banner";

export const createBanner = async (data: any) => {
  return await Banner.create(data);
};

export const getBanners = async () => {
  return await Banner.find().sort({ createdAt: -1 });
};

export const getActiveBanners = async () => {
  return await Banner.find({ isActive: true }).sort({ createdAt: -1 });
};

export const updateBanner = async (id: string, data: any) => {
  return await Banner.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

export const deleteBanner = async (id: string) => {
  return await Banner.findByIdAndDelete(id);
};
