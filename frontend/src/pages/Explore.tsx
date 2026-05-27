/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Navbar } from "../components/Navbar";
import { useCart } from "../context/CartContext";

interface Book {
  id: number;
  title: string;
  author: string;
  price: number;
  discount_price?: number;
  image_url: string;
  description?: string;
  technical_details?: string;
}

export const Explore: React.FC = () => {
  const [activeBook, setActiveBook] = useState<Book | null>(null);
  const [recommendations, setRecommendations] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "description" | "reviews" | "details"
  >("description");

  // ✅ Gunakan CartContext, bukan localStorage
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchExploreData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/books");
        const bookList = res.data.books || res.data;

        if (bookList && bookList.length > 0) {
          setActiveBook(bookList[0]);
          setRecommendations(bookList.slice(1, 4));
        }
      } catch (err) {
        console.error("Error fetching library data architecture:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExploreData();
  }, []);

  // ✅ Perbaikan: handleAddToCart pakai CartContext + support quantity > 1
  const handleAddToCart = async () => {
    if (!activeBook) return;
    setIsAdding(true);
    try {
      await addToCart(activeBook, quantity);
      alert(`${activeBook.title} berhasil ditambahkan ke keranjang!`);
    } catch (err: any) {
      alert(
        err.message ||
          "Gagal menambahkan ke keranjang. Pastikan Anda sudah login.",
      );
    } finally {
      setIsAdding(false);
    }
  };

  // Reset quantity saat ganti buku
  const handleSelectBook = (book: Book) => {
    setActiveBook(book);
    setQuantity(1);
    window.scrollTo(0, 0);
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center font-serif text-neutral-400">
        Loading editorial registry...
      </div>
    );
  if (!activeBook)
    return (
      <div className="min-h-screen flex items-center justify-center font-serif text-neutral-400">
        No volumes found in archive.
      </div>
    );

  return (
    <div className="bg-[#fbfbfa] min-h-screen animate-fade-in text-neutral-900">
      <Navbar />
      {/* Detail Utama Buku */}
      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-16">
        <div className="flex justify-center items-start bg-neutral-100 p-12 border border-neutral-200/60">
          <img
            src={activeBook.image_url || "/placeholder.jpg"}
            alt={activeBook.title}
            className="w-80 shadow-2xl border border-neutral-300 object-cover"
          />
        </div>

        <div className="space-y-6">
          <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-800">
            New Release • Hardcover
          </div>
          <h1 className="font-serif text-5xl leading-tight text-neutral-950">
            {activeBook.title}
          </h1>
          <p className="text-sm font-light text-neutral-500">
            by{" "}
            <span className="font-normal text-neutral-800">
              {activeBook.author}
            </span>
          </p>

          <div className="flex items-center space-x-1 text-amber-500 text-xs">
            <span>★★★★★</span>
            <span className="text-neutral-400 text-[11px] font-mono ml-2">
              (124 Reviews)
            </span>
          </div>

          <div className="flex items-baseline space-x-4 pt-2">
            <span className="font-serif text-4xl font-medium">
              $
              {Number(activeBook.discount_price || activeBook.price).toFixed(2)}
            </span>
            {activeBook.discount_price && (
              <span className="text-sm line-through text-neutral-400">
                ${Number(activeBook.price).toFixed(2)}
              </span>
            )}
          </div>

          <p className="text-sm text-neutral-600 font-light leading-relaxed pt-2">
            {activeBook.description ||
              "A haunting exploration of architectural aesthetics, design memory, and structural decay masterfully crafted for structural discovery."}
          </p>

          <div className="space-y-4 pt-4">
            <div className="flex items-center space-x-3">
              <span className="text-xs uppercase tracking-wider text-neutral-400 font-bold w-16">
                Quantity
              </span>
              <div className="flex items-center border border-neutral-300 bg-white">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-1 text-neutral-500 hover:bg-neutral-100"
                >
                  -
                </button>
                <span className="px-4 text-xs font-mono">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-1 text-neutral-500 hover:bg-neutral-100"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex space-x-4 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-widest transition ${
                  isAdding
                    ? "bg-neutral-400 cursor-not-allowed text-white"
                    : "bg-[#2c3e35] text-white hover:bg-emerald-950"
                }`}
              >
                {isAdding ? "Adding..." : "Add to Cart"}
              </button>
              <button className="px-8 border border-neutral-300 text-xs font-bold uppercase tracking-widest hover:border-black transition bg-white">
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Tabs Menu Section */}
      <section className="max-w-7xl mx-auto px-6 border-t border-neutral-200 mt-12 pt-8">
        <div className="flex space-x-8 border-b border-neutral-200 pb-px text-xs font-bold uppercase tracking-widest text-neutral-400">
          <button
            onClick={() => setActiveTab("description")}
            className={`pb-3 ${activeTab === "description" ? "text-black border-b-2 border-black" : ""}`}
          >
            Description
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`pb-3 ${activeTab === "reviews" ? "text-black border-b-2 border-black" : ""}`}
          >
            Reviews
          </button>
          <button
            onClick={() => setActiveTab("details")}
            className={`pb-3 ${activeTab === "details" ? "text-black border-b-2 border-black" : ""}`}
          >
            Technical Details
          </button>
        </div>
        <div className="py-8 text-sm text-neutral-600 max-w-3xl font-light leading-relaxed">
          {activeTab === "description" && (
            <p>
              {activeBook.description || "No extensive description cataloged."}
            </p>
          )}
          {activeTab === "reviews" && (
            <p>
              System community reviews are verified under modern editorial
              standards.
            </p>
          )}
          {activeTab === "details" && (
            <p>
              {activeBook.technical_details || "Standard Core Edition Asset."}
            </p>
          )}
        </div>
      </section>

      {/* Section Recommendations */}
      <section className="bg-neutral-50 border-t border-neutral-200 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-serif text-3xl mb-8">You might also enjoy</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recommendations.map((book) => (
              <div
                key={book.id}
                className="bg-white border border-neutral-200 p-6 flex flex-col justify-between hover:shadow-md transition"
              >
                <div className="flex justify-center bg-neutral-50 p-6 mb-4 border border-neutral-100">
                  <img
                    src={book.image_url || "/placeholder.jpg"}
                    alt=""
                    className="h-48 object-cover shadow-md"
                  />
                </div>
                <div>
                  <div className="text-[9px] font-bold tracking-widest uppercase text-emerald-800 mb-1">
                    Editor's Choice
                  </div>
                  <h3 className="font-serif font-medium text-lg text-neutral-900">
                    {book.title}
                  </h3>
                  <p className="text-xs text-neutral-400 font-light mt-0.5">
                    by {book.author}
                  </p>
                </div>
                <button
                  onClick={() => handleSelectBook(book)}
                  className="mt-4 text-xs font-bold uppercase tracking-wider text-neutral-600 hover:text-black text-left underline"
                >
                  Explore →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
