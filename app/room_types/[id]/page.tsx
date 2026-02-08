"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import UserNavbar from "@/app/(users)/users/components/User_Navbar";

type RoomImage = {
  id: number;
  imageUrl: string;
  isPrimary: boolean | null;
};

type RoomType = {
  id: number;
  name: string;
  description?: string | null;
  maxGuests: number;
  images?: RoomImage[];
};

export default function RoomTypeDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [roomType, setRoomType] = useState<RoomType | null>(null);
  const [images, setImages] = useState<RoomImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/admin/room_types/${id}`);

        if (!res.ok) {
          throw new Error("Failed to load room type");
        }

        const data = await res.json();
        const rt: RoomType | null = Array.isArray(data) ? data[0] : data;

        setRoomType(rt);
        setImages(rt?.images ?? []);
      } catch {
        setError("Failed to load room type");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const primaryIndexRaw = images.findIndex((img) => img.isPrimary);
  const primaryIndex =
    primaryIndexRaw !== -1 ? primaryIndexRaw : images.length > 0 ? 0 : -1;
  const primaryImage =
    primaryIndex !== -1 ? images[primaryIndex] : null;

  const openModal = (index: number) => {
    setActiveIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <UserNavbar />

      <main className="min-h-screen bg-gray-50 pt-28 px-6">
        <div className="max-w-5xl mx-auto">
          {loading && (
            <p className="text-gray-500 text-center py-20">
              Loading room details...
            </p>
          )}

          {!loading && error && (
            <p className="text-red-600 text-center py-20">{error}</p>
          )}

          {!loading && !error && !roomType && (
            <p className="text-gray-600 text-center py-20">
              Room type not found.
            </p>
          )}

          {!loading && !error && roomType && (
            <div className="space-y-8">
              <div className="grid gap-8 md:grid-cols-2">
                <div className="border rounded-lg overflow-hidden bg-white">
                    <div
                      className="h-80 bg-gray-100 cursor-pointer"
                      onClick={() => {
                        if (primaryIndex !== -1) {
                          openModal(primaryIndex);
                        }
                      }}
                    >
                    <img
                      src={primaryImage?.imageUrl ?? "/placeholder-room.jpg"}
                      alt={roomType.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  {images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2 p-4 bg-gray-50">
                        {images.map((img, index) => (
                        <img
                          key={img.id}
                          src={img.imageUrl}
                          alt={roomType.name}
                            className="h-20 w-full object-cover rounded cursor-pointer"
                            onClick={() => openModal(index)}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h1 className="text-3xl font-serif font-light">
                    {roomType.name}
                  </h1>
                  <p className="text-gray-700 leading-relaxed">
                    {roomType.description ?? "No description available."}
                  </p>
                  <p className="text-gray-600 text-sm">
                    Max guests: {roomType.maxGuests}
                  </p>

                  <div className="flex gap-3 pt-4">
                    <Link
                      href={`/reserve/${roomType.id}`}
                      className="px-6 py-3 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
                    >
                      Reserve this room
                    </Link>
                    <Link
                      href="/users#rooms"
                      className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                    >
                      Back to rooms
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {isModalOpen && activeIndex !== null && images[activeIndex] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={closeModal}
        >
          <div
            className="relative max-w-4xl max-h-[80vh] w-full px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute -top-10 right-4 text-white text-2xl"
              onClick={closeModal}
            >
              ×
            </button>
            <div className="bg-black rounded-lg overflow-hidden flex items-center justify-center">
              <img
                src={images[activeIndex].imageUrl}
                alt={roomType?.name}
                className="max-h-[80vh] w-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
