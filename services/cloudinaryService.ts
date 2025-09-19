export const uploadImageToCloudinary = async (imageUri: string) => {
    const data = new FormData();
    data.append("file", {
        uri: imageUri,
        type: "image/jpeg",
        name: "profile.jpg",
    } as any);

    data.append("upload_preset", "my_upload_preset");
    data.append("cloud_name", "davhloffd");

    try {
        const res = await fetch(
            `https://api.cloudinary.com/v1_1/davhloffd/image/upload`,
            {
                method: "POST",
                body: data,
            }
        );

        const result = await res.json();
        return result.secure_url;
    } catch (err) {
        console.error("Cloudinary upload error:", err);
        return null;
    }
};
