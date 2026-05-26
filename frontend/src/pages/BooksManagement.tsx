/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { SidebarAdmin } from "../components/SidebarAdmin";
import type { Book, Category } from "../types";

export const BooksManagement: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  // Form States
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [stock, setStock] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [techDetails, setTechDetails] = useState("");
  const [isEditorsChoice, setIsEditorsChoice] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const token = localStorage.getItem("bv_token");

  const fetchBooksAndCategories = async () => {
    const resBooks = await axios.get(
      "http://localhost:5000/api/books?limit=100",
    );
    setBooks(resBooks.data.books);
    setCategories(resBooks.data.categories);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBooksAndCategories();
  }, []);

  const openCreateModal = () => {
    setEditId(null);
    setTitle("");
    setAuthor("");
    setPrice("");
    setDiscountPrice("");
    setStock("");
    setCategoryId("");
    setDescription("");
    setTechDetails("");
    setIsEditorsChoice(false);
    setImageFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (book: Book) => {
    setEditId(book.id);
    setTitle(book.title);
    setAuthor(book.author);
    setPrice(book.price.toString());
    setDiscountPrice(book.discount_price?.toString() || "");
    setStock(book.stock.toString());
    setCategoryId(book.category_id?.toString() || "");
    setDescription(book.description || "");
    setTechDetails(book.technical_details || "");
    setIsEditorsChoice(book.is_editors_choice === 1);
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("author", author);
    formData.append("price", price);
    if (discountPrice) formData.append("discount_price", discountPrice);
    formData.append("stock", stock);
    formData.append("category_id", categoryId);
    formData.append("description", description);
    formData.append("technical_details", techDetails);
    formData.append("is_editors_choice", isEditorsChoice ? "1" : "0");
    if (imageFile) formData.append("image", imageFile);

    try {
      if (editId) {
        await axios.put(
          `http://localhost:5000/api/admin/books/${editId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          },
        );
      } else {
        await axios.post("http://localhost:5000/api/admin/books", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }
      setIsModalOpen(false);
      fetchBooksAndCategories();
    } catch (err) {
      alert("Error updating system architecture data.");
    }
  };

  const handleDelete = async (id: number) => {
    if (
      !window.confirm(
        "Are you certain you wish to eliminate this archival volume?",
      )
    )
      return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/books/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBooksAndCategories();
    } catch (err) {
      alert("Error executing deletion sequence.");
    }
  };

  return (
    <div className="flex bg-[#fbfbfa] min-h-screen">
      <SidebarAdmin />
      <main className="flex-1 p-12 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="font-serif text-4xl text-neutral-900">
              Books Repository
            </h1>
            <p className="text-xs text-neutral-500 font-light mt-1">
              Add, alter, or remove architectural literature products.
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="bg-[#2c3e35] text-white px-5 py-2.5 text-xs uppercase tracking-wider font-semibold hover:bg-emerald-950 transition"
          >
            Add New Volume
          </button>
        </div>

        {/* Tabel Data Buku */}
        <div className="border border-neutral-200 bg-white overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-[10px] uppercase tracking-widest text-neutral-400 font-bold">
                <th className="p-4">Volume Cover</th>
                <th className="p-4">Title & Author</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Base Price</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-neutral-100">
              {books.map((book) => (
                <tr key={book.id} className="hover:bg-neutral-50/50 transition">
                  <td className="p-4">
                    <img
                      src={book.image_url || "/placeholder.jpg"}
                      alt=""
                      className="w-10 h-14 object-cover border border-neutral-200"
                    />
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-neutral-900">
                      {book.title}
                    </div>
                    <div className="text-xs text-neutral-400 font-light">
                      {book.author}
                    </div>
                  </td>
                  <td className="p-4 font-mono text-xs">{book.stock} left</td>
                  <td className="p-4 font-serif font-medium">
                    ${Number(book.price).toFixed(2)}
                  </td>
                  <td className="p-4 text-right space-x-3">
                    <button
                      onClick={() => openEditModal(book)}
                      className="text-xs uppercase tracking-wider text-neutral-600 hover:text-black underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(book.id)}
                      className="text-xs uppercase tracking-wider text-red-600 hover:text-red-900 underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Pop-up (Form Add/Edit) */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-[#fbfbfa] border border-neutral-200 max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto space-y-6">
              <h2 className="font-serif text-2xl">
                {editId
                  ? "Modify Archival Entry"
                  : "Instate New Literary Object"}
              </h2>
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm"
              >
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Book Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-transparent border-b border-neutral-300 py-2 outline-none focus:border-black font-serif text-base"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Author
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full bg-transparent border-b border-neutral-300 py-2 outline-none focus:border-black"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Category
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-transparent border-b border-neutral-300 py-2 outline-none focus:border-black"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-transparent border-b border-neutral-300 py-2 outline-none focus:border-black"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Stock Units
                  </label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full bg-transparent border-b border-neutral-300 py-2 outline-none focus:border-black"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Exposition Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-transparent border border-neutral-300 p-3 h-24 outline-none focus:border-black resize-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Cover Art Graphic File
                  </label>
                  <input
                    type="file"
                    onChange={(e) =>
                      setImageFile(e.target.files ? e.target.files[0] : null)
                    }
                    className="w-full text-xs text-neutral-500 file:mr-4 file:py-2 file:px-4 file:border file:border-neutral-300 file:bg-transparent file:text-xs file:uppercase file:tracking-wider hover:file:bg-neutral-100"
                  />
                </div>
                <div className="md:col-span-2 flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="choice"
                    checked={isEditorsChoice}
                    onChange={(e) => setIsEditorsChoice(e.target.checked)}
                    className="accent-emerald-900"
                  />
                  <label
                    htmlFor="choice"
                    className="text-xs uppercase tracking-wider text-neutral-600 cursor-pointer"
                  >
                    Promote as Editor's Choice Selection
                  </label>
                </div>
                <div className="md:col-span-2 flex justify-end space-x-4 pt-4 border-t border-neutral-200">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="text-xs uppercase tracking-widest text-neutral-500 hover:text-black"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#2c3e35] text-white px-6 py-2.5 text-xs uppercase tracking-widest font-semibold hover:bg-emerald-950 transition"
                  >
                    Commit Matrix Data
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
