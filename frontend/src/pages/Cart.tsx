/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";

export const Cart: React.FC = () => {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const subtotal = cart.reduce(
    (acc, item) =>
      acc + Number(item.discount_price || item.price) * item.quantity,
    0,
  );
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Your cart is empty.");
    if (!fullName || !address || !city || !postalCode) {
      return alert("Please fill in all shipping details.");
    }

    const token = localStorage.getItem("bv_token");
    if (!token) return navigate("/login");

    setIsLoading(true);
    try {
      await axios.post(
        "http://localhost:5000/api/orders/checkout",
        {
          totalAmount: total,
          // ✅ Kirim book_id (bukan cart.id) ke backend
          cartItems: cart.map((item) => ({
            book_id: item.book_id ?? item.id,
            quantity: item.quantity,
            price: Number(item.discount_price || item.price),
          })),
          shippingDetails: {
            fullName,
            shippingAddress: address,
            city,
            postalCode,
          },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      await clearCart();
      navigate("/success");
    } catch (err: any) {
      console.error(err);
      alert(
        err.response?.data?.message || "Checkout failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#fbfbfa] min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-8 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {/* Daftar Buku */}
          <div>
            <h2 className="font-serif text-3xl mb-6">Your Library Selection</h2>
            {cart.length === 0 ? (
              <div className="py-16 text-center text-neutral-400 font-serif text-lg border border-dashed border-neutral-200">
                Your cart is empty. Browse our collection to add books.
              </div>
            ) : (
              <div className="divide-y divide-neutral-200">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="py-6 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-6">
                      <img
                        src={`http://localhost:5000/uploads/${item.image_url || "default.jpg"}`}
                        alt={item.title}
                        className="w-16 h-24 object-cover shadow"
                      />
                      <div>
                        <h4 className="font-serif text-lg text-neutral-900">
                          {item.title}
                        </h4>
                        <p className="text-xs text-neutral-500">
                          {item.author}
                        </p>
                        <div className="flex items-center space-x-2 mt-2 border border-neutral-300 w-28 justify-between px-2 py-1 bg-white">
                          <button
                            onClick={() => {
                              if (item.quantity === 1) {
                                removeFromCart(item.id);
                              } else {
                                updateQuantity(item.id, item.quantity - 1);
                              }
                            }}
                            className="text-neutral-500 hover:text-red-500 font-bold"
                          >
                            {item.quantity === 1 ? "×" : "−"}
                          </button>
                          <span className="text-xs font-mono">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="text-neutral-500 hover:text-black font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="font-serif text-lg">
                      $
                      {(
                        Number(item.discount_price || item.price) *
                        item.quantity
                      ).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Pengiriman — semua pakai placeholder */}
          <div className="space-y-6">
            <h3 className="font-serif text-2xl border-b border-neutral-200 pb-2">
              Shipping Destination
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full bg-transparent border-b border-neutral-300 py-2 focus:border-black outline-none font-serif text-lg placeholder:text-neutral-300"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1">
                  Shipping Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 123 Main Street"
                  className="w-full bg-transparent border-b border-neutral-300 py-2 focus:border-black outline-none font-serif text-lg placeholder:text-neutral-300"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Jakarta"
                  className="w-full bg-transparent border-b border-neutral-300 py-2 focus:border-black outline-none font-serif text-lg placeholder:text-neutral-300"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="e.g. 12345"
                  className="w-full bg-transparent border-b border-neutral-300 py-2 focus:border-black outline-none font-serif text-lg placeholder:text-neutral-300"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="border border-neutral-200 p-8 bg-white h-fit space-y-6 lg:sticky lg:top-8">
          <h3 className="font-serif text-2xl mb-4">Order Summary</h3>
          <div className="flex justify-between text-sm text-neutral-600">
            <span>
              Subtotal ({cart.length} item{cart.length !== 1 ? "s" : ""})
            </span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-neutral-600">
            <span>Estimated Tax (8%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-neutral-600 border-b border-neutral-200 pb-4">
            <span>Shipping</span>
            <span className="text-emerald-800 font-semibold">Free</span>
          </div>
          <div className="flex justify-between text-xl font-serif">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={isLoading || cart.length === 0}
            className={`w-full py-4 uppercase tracking-widest text-xs font-semibold transition ${
              isLoading || cart.length === 0
                ? "bg-neutral-300 cursor-not-allowed text-neutral-500"
                : "bg-[#2c3e35] text-white hover:bg-emerald-950"
            }`}
          >
            {isLoading ? "Processing..." : "Complete Purchase"}
          </button>
        </div>
      </div>
    </div>
  );
};
    