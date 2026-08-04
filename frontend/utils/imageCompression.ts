/**
 * Compresses and resizes an image File object in the browser.
 * 
 * @param file - Original image file
 * @param maxWidth - Maximum width allowed (default: 1200px)
 * @param quality - Compression quality between 0 and 1 (default: 0.8)
 * @returns Promise resolving to the compressed File object
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1200,
  quality: number = 0.8
): Promise<File> {
  // যদি ফাইলটি ইমেজ না হয়, তবে অপরিবর্তিত অবস্থায় রিটার্ন করা
  if (!file || !file.type.startsWith("image/")) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = (error) => reject(error);

    reader.onload = (event) => {
      const img = new Image();

      img.onerror = (error) => reject(error);

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // প্রোপোশন ঠিক রেখে রিসাইজ করা
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return resolve(file); // ক্যানভাস কনটেক্সট না পেলে অরিজিনাল ফাইল রিটার্ন করবে
        }

        // স্মুথ ইমেজ রেন্ডারিংয়ের জন্য
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve(file);
            }

            // যদি কম্প্রেশনের পর ফাইলের সাইজ অরিজিনালের চেয়ে বেশি হয়ে যায়, তবে অরিজিনাল ফাইলই রিটার্ন করা ভালো
            if (blob.size >= file.size) {
              return resolve(file);
            }

            const compressedFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, "") + ".jpg", // এক্সটেনশন `.jpg` এ কনভার্ট করা
              {
                type: "image/jpeg",
                lastModified: Date.now(),
              }
            );

            resolve(compressedFile);
          },
          "image/jpeg",
          quality
        );
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
