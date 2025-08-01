export const uploadImageToCloudinary = async (file) => {
  const CLOUD_NAME = "delymndws"; // ⛔ Replace with your actual cloud name
  const UPLOAD_PRESET = "voxindia";     // ✅ Your preset

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", "samples/ecommerce"); // optional

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json();

  if (data.secure_url) return data.secure_url;
  else throw new Error(data.error.message);
};
