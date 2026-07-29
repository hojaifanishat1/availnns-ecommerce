const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://miniature-telegram-xrwrwxwvw79xfvj6-5000.app.github.dev/api";

export const getAdminBanners = async (token: string) => {
  const res = await fetch(`${API_URL}/banners`, {
    headers: { Authorization: `Bearer ` + token },
  });
  const data = await res.json();
  return data.data;
};

export const getActiveBanners = async () => {
  const res = await fetch(`${API_URL}/banners/active`);
  const data = await res.json();
  return data.data;
};

export const createBanner = async (bannerData: any, token: string) => {
  // যদি FormData পাঠানো হয়, তবে "Content-Type" হেডার বাদ দিতে হবে যাতে ব্রাউজার নিজে থেকে multipart/form-data সেট করতে পারে
  const isFormData = bannerData instanceof FormData;

  const headers: Record<string, string> = {
    Authorization: `Bearer ` + token,
  };

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_URL}/banners`, {
    method: "POST",
    headers,
    body: isFormData ? bannerData : JSON.stringify(bannerData),
  });
  return await res.json();
};

export const removeBanner = async (id: string, token: string) => {
  const res = await fetch(`${API_URL}/banners/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ` + token },
  });
  return await res.json();
};
