import imageCompression from "browser-image-compression";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import { useState } from "react";
import { useDropzone } from "react-dropzone";

const DropZone = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const onDrop = (acceptedFiles: any) => {
    setFiles(acceptedFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    //if allow all images then use blank array
    accept: { "image/*": [] },
    maxFiles: 5,
    maxSize: 20 * 1024 * 1024,
    onDrop,
  });

  const handleCompress = async () => {
    if (!files.length) return;

    setLoading(true);
    const zip = new JSZip();

    try {
      await Promise.all(
        files.map(async (file, index) => {
          const compressed = await imageCompression(file, {
            maxSizeMB: 1,
            maxWidthOrHeight: 1024,
            useWebWorker: true,
          });

          zip.file(`image-${index}.jpg`, compressed);
        }),
      );

      const zipBlob = await zip.generateAsync({ type: "blob" });
      console.log(zipBlob);
      saveAs(zipBlob, "compressed-images.zip");
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <>
      <div
        {...getRootProps({
          className: `border border-dashed rounded-xl h-64 w-[80%] flex justify-center items-center`,
        })}
      >
        <input {...getInputProps()} />
        {isDragActive
          ? "Drop images here..."
          : "Drag & drop images here, or click to select Max Limit 5 image"}
      </div>

      <button
        className="bg-pink-600 hover:bg-pink-400 hover:text-black text-white px-8 py-2 rounded-md"
        onClick={handleCompress}
        disabled={loading}
      >
        {loading ? "Processing..." : "Compress & Download ZIP"}
      </button>

      <div className="flex flex-col">
        Images :
        <div className="flex justify-center items-center gap-4">
          {files?.map((file) => (
            <div className="flex flex-col gap-2 max-w-34" key={file?.name}>
              <img
                className="w-32 h-24 rounded-md"
                src={URL.createObjectURL(file)}
              />
              <li className="list-none">{file?.name.slice(0, 14)}</li>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default DropZone;
