"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type PreviewImage = {
  file: File;
  url: string;
};

export default function NewRoomTypePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [maxGuests, setMaxGuests] = useState(1);
  const [images, setImages] = useState<PreviewImage[]>([]);
  const [primaryIndex, setPrimaryIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  /* =====================
     HANDLE IMAGE UPLOAD
  ===================== */
  const handleImages = (files: FileList | null) => {
    if (!files) return;

    const newImages: PreviewImage[] = Array.from(files).map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newImages]);
  };

  /* =====================
     REMOVE IMAGE
  ===================== */
  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    if (primaryIndex === index) setPrimaryIndex(0);
  };

  /* =====================
     SUBMIT FORM
  ===================== */
  const submit = async () => {
    setLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("maxGuests", String(maxGuests));
    formData.append("primaryIndex", String(primaryIndex));

    images.forEach((img) => {
      formData.append("images", img.file);
    });

    await fetch("/api/admin/room_types", {
      method: "POST",
      body: formData,
    });

    router.push("/admin/room_types");
    router.refresh();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            New Room Type
          </h1>
          <p className="text-xs md:text-sm text-slate-500">
            Define the details and upload images for this room type
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-4 md:p-6 shadow-sm space-y-4">
          <div className="space-y-1">
            <label className="block text-xs md:text-sm font-medium text-slate-700">
              Room Type Name
            </label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/50"
              placeholder="e.g. Deluxe Suite"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs md:text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/50 min-h-[100px]"
              placeholder="Highlight size, amenities, and ideal guests"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs md:text-sm font-medium text-slate-700">
              Maximum Guests
            </label>
            <input
              type="number"
              min={1}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/50"
              placeholder="Number of guests allowed"
              value={maxGuests}
              onChange={(e) => setMaxGuests(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs md:text-sm font-medium text-slate-700">
              Room Images
            </label>
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center">
              <input
                type="file"
                multiple
                accept="image/*"
                className="block w-full text-xs text-slate-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-900 file:px-3 file:py-2 file:text-xs file:font-medium file:text-white hover:file:bg-blue-800"
                onChange={(e) => handleImages(e.target.files)}
              />
              <p className="mt-2 text-[11px] md:text-xs text-slate-500">
                Upload clear photos of the room. The primary image will be used
                as the main display photo.
              </p>
            </div>
          </div>

          {images.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs md:text-sm font-medium text-slate-700">
                Image Preview
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {images.map((img, index) => (
                  <div
                    key={index}
                    className={`relative rounded-lg overflow-hidden border ${
                      primaryIndex === index
                        ? "ring-2 ring-slate-900"
                        : "border-slate-200"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt="Preview"
                      className="h-32 w-full object-cover"
                    />
                    {primaryIndex === index && (
                      <span className="absolute top-1 left-1 rounded-full bg-slate-900 px-2 py-1 text-[10px] font-medium text-white">
                        Primary
                      </span>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 flex bg-slate-900/70">
                      <button
                        type="button"
                        onClick={() => setPrimaryIndex(index)}
                        className="flex-1 py-1 text-[11px] font-medium text-white hover:bg-slate-800"
                      >
                        Set Primary
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="flex-1 py-1 text-[11px] font-medium text-red-300 hover:bg-red-800/70"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={submit}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-lg bg-blue-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create Room Type"}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-900 text-white rounded-xl p-4 md:p-6 shadow-sm space-y-2">
            <p className="text-sm font-semibold">Tips for great listings</p>
            <ul className="mt-2 space-y-1 text-xs text-slate-200">
              <li>• Use a clear, descriptive room name.</li>
              <li>• Highlight unique features in the description.</li>
              <li>• Upload at least one bright, high-quality photo.</li>
            </ul>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-6 shadow-sm text-xs md:text-sm text-slate-600 space-y-2">
            <p className="font-medium text-slate-900">Primary image</p>
            <p>
              The primary image is shown first on listing cards and room detail
              pages. Choose the photo that best represents this room type.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
