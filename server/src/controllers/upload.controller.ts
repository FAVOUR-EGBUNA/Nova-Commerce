import type { Request, Response } from "express";
import { Readable } from "stream";

import cloudinary from "../config/cloudinary.js";

export async function uploadProductImage(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select an image.",
      });
    }

    // Capture the buffer here so TypeScript knows
    // it definitely exists inside the Promise callback.
    const fileBuffer = req.file.buffer;

    const uploadResult = await new Promise<{
      secure_url: string;
      public_id: string;
    }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "nova-commerce/products",
          resource_type: "image",
          transformation: [
            {
              width: 1200,
              height: 1500,
              crop: "fill",
              gravity: "auto",
            },
            {
              quality: "auto",
              fetch_format: "auto",
            },
          ],
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }

          if (!result) {
            reject(new Error("Cloudinary returned no upload result."));
            return;
          }

          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
          });
        },
      );

      Readable.from(fileBuffer).pipe(uploadStream);
    });

    return res.status(201).json({
      success: true,
      data: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      },
    });
  } catch (error) {
    console.error("Product image upload error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to upload image.",
    });
  }
}
