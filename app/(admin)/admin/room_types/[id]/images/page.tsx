"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Image = {
  id: number;
  imageUrl: string;
  isPrimary: boolean;
};

export default function RoomTypeImagesPage() {
  const { id } = useParams<{ id: string }>();

  const [images, setImages] = useState<Image[]>([]);
  const [file, setFile] = useState<File | null>(null);

  const loadImages = () => {
    fetch(`/api/admin/room-types/${id}/images`)
      .then((res) => res.json())
      .then(setImages);
  };

  useEffect(() => {
    loadImages();
  }, [id]);

  const upload = async () => {
    if (!file) return;

    // upload file
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "room-types");

    const uploadRes = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const { url } = await uploadRes.json();

    // save to DB
    await fetch(`/api/admin/room-types/${id}/images`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl: url }),
    });

    setFile(null);
    loadImages();
  };

  const setPrimary = async (imageId: number) => {
    await fetch(`/api/admin/room-types/images/${imageId}/primary`, {
      method: "PATCH",
    });
    loadImages();
  };

  const remove = async (imageId: number) => {
    await fetch(`/api/admin/room-types/images/${imageId}`, {
      method: "DELETE",
    });
    loadImages();
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Room Type Images</h1>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button onClick={upload} className="ml-2 bg-black text-white px-3 py-1">
        Upload
      </button>

      <div className="grid grid-cols-3 gap-4 mt-6">
        {images.map((img) => (
          <div key={img.id} className="border p-2">
            <img src={img.imageUrl} className="h-32 w-full object-cover" />

            {img.isPrimary && (
              <span className="text-green-600 text-sm">Primary</span>
            )}

            <div className="flex gap-2 mt-2">
              {!img.isPrimary && (
                <button
                  onClick={() => setPrimary(img.id)}
                  className="text-sm underline"
                >
                  Set Primary
                </button>
              )}

              <button
                onClick={() => remove(img.id)}
                className="text-sm text-red-600 underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
