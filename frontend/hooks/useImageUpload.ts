"use client";

import { useState } from "react";

import {
  uploadProductImage,
} from "@/services/media.service";


import {
  validateImage,
} from "@/utils/imageValidator";


import {
  compressImage,
} from "@/utils/imageCompression";



export default function useImageUpload() {


  const [uploading, setUploading] =
    useState(false);


  const [progress, setProgress] =
    useState(0);


  const [error, setError] =
    useState("");



  const uploadImage = async (
    file: File
  ) => {


    try {


      setError("");

      setUploading(true);


      setProgress(10);



      const validation =
        validateImage(file);



      if (!validation.valid) {

        throw new Error(
          validation.message
        );

      }



      setProgress(30);



      const compressed =
        await compressImage(file);



      setProgress(50);



      const response =
        await uploadProductImage(
          compressed
        );



      setProgress(100);



      return {


        url: response.url,


        publicId:
          response.publicId,


        alt:
          file.name,


      };



    } catch(error:any) {


      setError(
        error.message ||
        "Upload failed"
      );


      throw error;



    } finally {


      setUploading(false);



      setTimeout(()=>{

        setProgress(0);

      },1000);


    }


  };





  const uploadMultiple = async (
    files: File[]
  ) => {


    const uploaded = [];


    for(const file of files){


      const image =
        await uploadImage(file);


      uploaded.push(image);


    }


    return uploaded;


  };





  return {


    uploadImage,


    uploadMultiple,


    uploading,


    progress,


    error,


  };


}