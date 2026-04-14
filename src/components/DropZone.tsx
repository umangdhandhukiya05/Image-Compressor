import imageCompression from "browser-image-compression";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import { useState } from "react";
import { useDropzone } from "react-dropzone";

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

const DropZone = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const [compressedResult, setCompressedResult] = useState<{
    originalSize: number;
    compressedSize: number;
    zipBlob: Blob;
  } | null>(null);

  const onDrop = (acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    maxFiles: 5,
    maxSize: 20 * 1024 * 1024,
    onDrop,
  });

  const handleCompress = async () => {
    if (!files.length) return;

    setLoading(true);
    const zip = new JSZip();

    let originalTotal = 0;
    let compressedTotal = 0;

    try {
      await Promise.all(
        files.map(async (file, index) => {
          originalTotal += file.size;

          const compressed = await imageCompression(file, {
            maxSizeMB: 1,
            maxWidthOrHeight: 1024,
            useWebWorker: true,
          });

          compressedTotal += compressed.size;
          zip.file(`image-${index}.jpg`, compressed);
        })
      );

      const zipBlob = await zip.generateAsync({ type: "blob" });

      // After generating the zip, show the popup modal
      setCompressedResult({
        originalSize: originalTotal,
        compressedSize: compressedTotal,
        zipBlob,
      });
    } catch (err) {
      console.error(err);
      alert("An error occurred while compressing");
    }

    setLoading(false);
  };

  const handleDownload = () => {
    if (compressedResult?.zipBlob) {
      saveAs(compressedResult.zipBlob, "compressed-images.zip");
      setCompressedResult(null);
    }
  };

  const handleCancel = () => {
    setCompressedResult(null);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 flex flex-col items-center">
      {/* Upload Box */}
      <div
        {...getRootProps({
          className: `border-2 border-dashed rounded-xl h-48 sm:h-64 w-full md:w-[80%] flex flex-col justify-center items-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-pink-500 bg-pink-50"
              : "border-gray-300 hover:border-pink-400 bg-gray-50 hover:bg-gray-100"
          }`,
        })}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-pink-600 font-medium">Drop images here...</p>
        ) : (
          <div className="text-center px-4">
            <p className="text-gray-700 font-medium sm:text-lg">
              Drag & drop images here
            </p>
            <p className="text-gray-500 text-sm mt-1">
              or click to select (Max Limit 5 images)
            </p>
          </div>
        )}
      </div>

      <button
        className="mt-8 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-medium shadow transition-all duration-300 min-w-[200px]"
        onClick={handleCompress}
        disabled={loading || files.length === 0}
      >
        {loading ? "Processing..." : "Compress Images"}
      </button>

      {/* Image Preview Section */}
      {files.length > 0 && (
        <div className="w-full mt-10">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">
            Images :
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {files.map((file, i) => (
              <div
                className="flex flex-col bg-white border border-gray-200 rounded-xl p-3 shadow-sm"
                key={`${file.name}-${i}`}
              >
                <div className="w-full h-24 sm:h-32 bg-gray-100 rounded-lg overflow-hidden mb-3">
                  <img
                    className="w-full h-full object-cover"
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                  />
                </div>
                <p
                  className="text-sm font-semibold text-gray-800 truncate"
                  title={file.name}
                >
                  {file.name}
                </p>
                <p className="text-xs font-medium text-gray-500 mt-1">
                  Original Size:{" "}
                  <span className="text-gray-700">{formatBytes(file.size)}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Popup Modal */}
      {compressedResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8 animate-in zoom-in-95 duration-200">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6 shadow-sm">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Compression Complete!
              </h3>
              <p className="text-gray-500 mb-8">
                Your images are ready. Here are your final results:
              </p>

              {/* Size Comparison Card */}
              <div className="bg-gray-50 rounded-xl p-5 mb-8 flex justify-between items-center border border-gray-100 shadow-inner">
                <div className="text-left flex-1 border-r border-gray-200 pr-2">
                  <p className="text-xs text-gray-500 font-bold tracking-wider uppercase mb-1">
                    Original
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-gray-800">
                    {formatBytes(compressedResult.originalSize)}
                  </p>
                </div>

                <div className="px-4 flex items-center justify-center">
                  <div className="bg-pink-100 p-2 rounded-full">
                    <svg
                      className="w-5 h-5 text-pink-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </div>
                </div>

                <div className="text-right flex-1 pl-2">
                  <p className="text-xs text-green-600 font-bold tracking-wider uppercase mb-1">
                    Compressed
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-green-600">
                    {formatBytes(compressedResult.compressedSize)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <button
                type="button"
                className="w-full sm:w-1/2 justify-center rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm sm:text-base font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-colors"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                type="button"
                className="w-full sm:w-1/2 flex justify-center items-center gap-2 rounded-xl border border-transparent bg-pink-600 px-4 py-3 text-sm sm:text-base font-bold text-white shadow-md hover:bg-pink-700 transition-colors"
                onClick={handleDownload}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download ZIP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Modal */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all text-center">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 flex flex-col items-center justify-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 border-4 border-pink-100 border-t-pink-600 rounded-full animate-spin mb-6"></div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Compressing Images</h3>
            <p className="text-gray-500 text-sm">Please wait while we reduce the size of your images...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DropZone;
