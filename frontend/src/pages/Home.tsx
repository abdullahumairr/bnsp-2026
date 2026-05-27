/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import axios from "axios";
import type { Book } from "../types";
import { Link } from "react-router-dom";
import { Navbar } from "../components/Navbar";

export const Home: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState("All Works");

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/books?category=${selectedCat}`)
      .then((res) => {
        setBooks(res.data.books);
        setCategories(res.data.categories);
      });
  }, [selectedCat]);

  return (
    <div className="bg-[#fbfbfa] min-h-screen">
      <Navbar />
      {/* Hero */}
      <header className="max-w-7xl mx-auto px-8 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <span className="text-xs uppercase tracking-widest text-neutral-500 font-semibold">
            Season Curations
          </span>
          <h1 className="font-serif text-6xl text-neutral-900 leading-tight">
            Summer Reading Essentials
          </h1>
          <p className="text-neutral-600 font-light max-w-md">
            Discover our meticulously curated selection of timeless literature
            and modern masterpieces, handpicked for the warmer days ahead.
          </p>
          <div className="flex space-x-4">
            <Link
              to="/explore"
              className="bg-[#2c3e35] text-white px-6 py-3 text-xs uppercase tracking-wider font-semibold"
            >
              Explore Collection
            </Link>
            <button className="border border-neutral-300 px-6 py-3 text-xs uppercase tracking-wider font-semibold bg-transparent">
              View Lookbook
            </button>
          </div>
        </div>
        <div>
          <img
            src="https://images.unsplash.com/photo-1544947950-fa07a98d237f"
            alt="Hero Books"
            className="w-full h-[400px] object-cover shadow-sm grayscale-[20%]"
          />
        </div>
      </header>

      {/* Filter Category & Grid */}
      <main className="max-w-7xl mx-auto px-8 py-12">
        <div className="border-b border-neutral-200 pb-4 mb-8 flex space-x-6 text-sm overflow-x-auto">
          {[
            "All Works",
            "Philosophy",
            "Contemporary Fiction",
            "Art & Architecture",
            "Poetry",
            "Scientific Journals",
          ].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`pb-2 uppercase tracking-wider text-xs font-semibold ${selectedCat === cat ? "border-b-2 border-neutral-900 text-black" : "text-neutral-400"}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {books.map((book) => (
            <Link
              to={`/book/${book.id}`}
              key={book.id}
              className="group space-y-3"
            >
              <div className="bg-neutral-100 p-6 flex justify-center items-center h-80 relative overflow-hidden">
                <img
                  src={book.image_url || "/placeholder.jpg"}
                  alt={book.title}
                  className="h-64 object-contain shadow-md group-hover:scale-105 transition duration-300"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">
                  {book.category_name || "Literature"}
                </span>
                <h3 className="font-serif text-lg text-neutral-900 font-medium group-hover:underline">
                  {book.title}
                </h3>
                <p className="text-xs text-neutral-500">{book.author}</p>
                <p className="text-sm font-semibold mt-1 text-neutral-800">
                  ${Number(book.price).toFixed(2)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};
