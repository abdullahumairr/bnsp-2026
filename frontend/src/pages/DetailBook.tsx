/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import type { Book } from "../types";
import { useCart } from "../context/CartContext";
import { Navbar } from "../components/Navbar";

export const DetailBook: React.FC = () => {
  const { id } = useParams();
  const [data, setData] = useState<{
    book: Book;
    recommendations: Book[];
  } | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/books/${id}`)
      .then((res) => setData(res.data))
      .catch((err) => console.error("Error fetching book:", err));
  }, [id]);

  const handleAddToCart = async () => {
    if (!data) return;
    setIsAdding(true);
    try {
      await addToCart(data.book, 1);
      alert("Berhasil ditambahkan ke koleksi!");
    } catch (err) {
      alert("Gagal menambahkan ke keranjang. Pastikan Anda sudah login.");
    } finally {
      setIsAdding(false);
    }
  };

  if (!data)
    return <div className="text-center p-20">Loading literary item...</div>;
  const { book, recommendations } = data;

  return (
    <div className="bg-[#fbfbfa] min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-8 py-16 grid grid-cols-1 md:grid-cols-2 gap-16">
        <div className="bg-neutral-100 p-12 flex justify-center items-center h-[500px]">
          <img
            src={book.image_url || "/placeholder.jpg"}
            alt={book.title}
            className="h-full object-contain shadow-2xl"
          />
        </div>
        <div className="space-y-6">
          <div className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
            New Release • Hardcover
          </div>
          <h1 className="font-serif text-5xl text-neutral-900 leading-tight">
            {book.title}
          </h1>
          <p className="text-neutral-500 italic font-serif">by {book.author}</p>
          <div className="text-3xl font-serif text-neutral-800">
            ${Number(book.discount_price || book.price).toFixed(2)}
          </div>
          <p className="text-neutral-600 font-light leading-relaxed">
            {book.description}
          </p>

          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className={`w-full py-4 text-xs uppercase tracking-widest font-semibold transition ${
              isAdding
                ? "bg-neutral-400 cursor-not-allowed"
                : "bg-[#2c3e35] hover:bg-emerald-950 text-white"
            }`}
          >
            {isAdding ? "Adding..." : "Add to Cart"}
          </button>

          <div className="border-t border-neutral-200 pt-6 mt-8 space-y-4">
            <h4 className="text-xs uppercase tracking-widest font-bold">
              Technical Details
            </h4>
            <p className="text-sm text-neutral-600 font-light">
              {book.technical_details ||
                "No structural specification provided."}
            </p>
          </div>
        </div>
      </div>

      {/* Editorial Recommendations Area */}
      <section className="max-w-7xl mx-auto px-8 py-16 border-t border-neutral-200">
        <h2 className="font-serif text-3xl mb-8">You might also enjoy</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {recommendations.map((rec) => (
            <Link
              to={`/book/${rec.id}`}
              key={rec.id}
              className="border border-neutral-200 p-6 bg-white flex flex-col justify-between hover:shadow-md transition"
            >
              <img
                src={rec.image_url || "/placeholder.jpg"}
                alt={rec.title}
                className="h-40 object-contain mx-auto mb-4"
              />
              <div>
                <h4 className="font-serif text-lg">{rec.title}</h4>
                <p className="text-xs text-neutral-500">
                  ${Number(rec.price).toFixed(2)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};
