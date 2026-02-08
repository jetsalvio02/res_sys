"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type ExistingImage = {
  id: number;
  imageUrl: string;
  isPrimary: boolean;
};

type NewImage = {
  file: File;
  url: string;
};

export default function EditRoomTypePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    description: "",
    maxGuests: 1,
  });

  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [newImages, setNewImages] = useState<NewImage[]>([]);
  const [primaryKey, setPrimaryKey] = useState<string>("");

  /* =====================
     LOAD DATA
  ===================== */
  useEffect(() => {
    fetch(`/api/admin/room_types/${id}`)
      .then((res) => res.json())
      .then((data) => {
        const roomType = Array.isArray(data) ? data[0] : data;

        setForm({
          name: roomType?.name ?? "",
          description: roomType?.description ?? "",
          maxGuests: roomType?.maxGuests ?? 1,
        });

        setExistingImages(roomType?.images ?? []);

        const primary = roomType?.images?.find(
          (i: ExistingImage) => i.isPrimary,
        );

        if (primary) {
          setPrimaryKey(`existing-${primary.id}`);
        }
      });
  }, [id]);

  /* =====================
     ADD NEW IMAGES
  ===================== */
  const handleNewImages = (files: FileList | null) => {
    if (!files) return;

    const mapped = Array.from(files).map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setNewImages((prev) => [...prev, ...mapped]);
  };

  /* =====================
     REMOVE IMAGE
  ===================== */
  const removeExisting = (imageId: number) => {
    setExistingImages((prev) => prev.filter((i) => i.id !== imageId));
    if (primaryKey === `existing-${imageId}`) setPrimaryKey("");
  };

  const removeNew = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    if (primaryKey === `new-${index}`) setPrimaryKey("");
  };

  /* =====================
     SUBMIT
  ===================== */
  const submit = async () => {
    const formData = new FormData();

    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("maxGuests", String(form.maxGuests));
    formData.append("primaryKey", primaryKey);

    formData.append(
      "remainingImages",
      JSON.stringify(existingImages.map((i) => i.id)),
    );

    newImages.forEach((img) => {
      formData.append("images", img.file);
    });

    await fetch(`/api/admin/room_types/${id}`, {
      method: "PATCH",
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
            Edit Room Type
          </h1>
          <p className="text-xs md:text-sm text-slate-500">
            Update details and images for this room type
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
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs md:text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/50 min-h-[100px]"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
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
              value={form.maxGuests}
              onChange={(e) =>
                setForm({ ...form, maxGuests: Number(e.target.value) })
              }
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs md:text-sm font-medium text-slate-700">
              Upload New Images
            </label>
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center">
              <input
                type="file"
                multiple
                accept="image/*"
                className="block w-full text-xs text-slate-500 file:mr-4 file:rounded-md file:border-0 file:bg-green-900 file:px-3 file:py-2 file:text-xs file:font-medium file:text-white hover:file:bg-green-800"
                onChange={(e) => handleNewImages(e.target.files)}
              />
              <p className="mt-2 text-[11px] md:text-xs text-slate-500">
                Add more photos to better showcase this room type.
              </p>
            </div>
          </div>

          {(existingImages.length > 0 || newImages.length > 0) && (
            <div className="space-y-2">
              <p className="text-xs md:text-sm font-medium text-slate-700">
                Images
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {existingImages.map((img) => (
                  <div
                    key={`existing-${img.id}`}
                    className={`relative rounded-lg overflow-hidden border ${
                      primaryKey === `existing-${img.id}`
                        ? "ring-2 ring-slate-900"
                        : "border-slate-200"
                    }`}
                  >
                    <img
                      src={img.imageUrl}
                      className="h-32 w-full object-cover"
                    />
                    {primaryKey === `existing-${img.id}` && (
                      <span className="absolute top-1 left-1 rounded-full bg-slate-900 px-2 py-1 text-[10px] font-medium text-white">
                        Primary
                      </span>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 flex bg-slate-900/70">
                      <button
                        onClick={() => setPrimaryKey(`existing-${img.id}`)}
                        className="flex-1 py-1 text-[11px] font-medium text-white hover:bg-slate-800"
                      >
                        Set Primary
                      </button>
                      <button
                        onClick={() => removeExisting(img.id)}
                        className="flex-1 py-1 text-[11px] font-medium text-red-300 hover:bg-red-800/70"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}

                {newImages.map((img, index) => (
                  <div
                    key={`new-${index}`}
                    className={`relative rounded-lg overflow-hidden border ${
                      primaryKey === `new-${index}`
                        ? "ring-2 ring-slate-900"
                        : "border-slate-200"
                    }`}
                  >
                    <img
                      src={img.url}
                      className="h-32 w-full object-cover"
                    />
                    {primaryKey === `new-${index}` && (
                      <span className="absolute top-1 left-1 rounded-full bg-slate-900 px-2 py-1 text-[10px] font-medium text-white">
                        Primary
                      </span>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 flex bg-slate-900/70">
                      <button
                        onClick={() => setPrimaryKey(`new-${index}`)}
                        className="flex-1 py-1 text-[11px] font-medium text-white hover:bg-slate-800"
                      >
                        Set Primary
                      </button>
                      <button
                        onClick={() => removeNew(index)}
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
              className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700"
            >
              Save Changes
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-green-900 text-white rounded-xl p-4 md:p-6 shadow-sm space-y-2">
            <p className="text-sm font-semibold">Editing tips</p>
            <ul className="mt-2 space-y-1 text-xs text-slate-200">
              <li>• Keep the name consistent with similar room types.</li>
              <li>• Clarify what changed in the description.</li>
              <li>• Replace outdated images with fresh photos.</li>
            </ul>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-6 shadow-sm text-xs md:text-sm text-slate-600 space-y-2">
            <p className="font-medium text-slate-900">Primary image</p>
            <p>
              The primary image is shown first on listing cards and room detail
              pages. Make sure it represents the current look of the room.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
