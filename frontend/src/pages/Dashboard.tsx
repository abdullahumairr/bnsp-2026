/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { SidebarAdmin } from "../components/SidebarAdmin";

const ITEMS_PER_PAGE = 10;

export const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("bv_token");
    axios
      .get("http://localhost:5000/api/admin/metrics", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setMetrics(res.data));
  }, []);

  if (!metrics)
    return (
      <div className="p-12 font-serif text-neutral-400">
        Loading matrix system telemetry...
      </div>
    );

  // Filter berdasarkan search
  const filtered = metrics.recentTransactions.filter(
    (tx: any) =>
      tx.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      tx.books_title?.toLowerCase().includes(search.toLowerCase()) ||
      String(tx.id).includes(search),
  );

  // Pagination
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="flex bg-[#fbfbfa] min-h-screen">
      <SidebarAdmin />
      <main className="flex-1 p-12 space-y-10">
        <div>
          <h1 className="font-serif text-4xl text-neutral-900">
            Dashboard Overview
          </h1>
          <p className="text-sm text-neutral-500 mt-1 font-light">
            Insights and administrative controls for the BookVerse ecosystem.
          </p>
        </div>

        {/* 3 Metric Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-neutral-200 p-6 bg-white space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block">
              Total Sales
            </span>
            <div className="text-3xl font-serif font-semibold">
              $
              {Number(metrics.totalSales).toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </div>
            <p className="text-[11px] text-neutral-400">
              All completed transactions
            </p>
          </div>
          <div className="border border-neutral-200 p-6 bg-white space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block">
              Total Books Stock
            </span>
            <div className="text-3xl font-serif font-semibold">
              {metrics.totalBooks} Units
            </div>
            <p className="text-[11px] text-neutral-400">Across all titles</p>
          </div>
          <div className="border border-neutral-200 p-6 bg-white space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block">
              System Registered Users
            </span>
            <div className="text-3xl font-serif font-semibold">
              {metrics.totalUsers}
            </div>
            <p className="text-[11px] text-neutral-400">Registered accounts</p>
          </div>
        </section>

        {/* Tabel Semua Transaksi */}
        <section className="border border-neutral-200 bg-white">
          <div className="px-6 pt-6 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100">
            <div>
              <h3 className="font-serif text-xl text-neutral-900">
                All System Transactions
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                {filtered.length} transaction{filtered.length !== 1 ? "s" : ""}{" "}
                found
              </p>
            </div>
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search by buyer, book, or ID..."
              className="border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-black bg-neutral-50 w-full md:w-72"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-[10px] uppercase tracking-wider text-neutral-500 font-bold">
                  <th className="py-3 px-6">Order ID</th>
                  <th className="py-3 px-6">Buyer</th>
                  <th className="py-3 px-6">Books</th>
                  <th className="py-3 px-6">City</th>
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-6 text-right">Amount</th>
                  <th className="py-3 px-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-sm">
                {paginated.length > 0 ? (
                  paginated.map((tx: any) => (
                    <tr
                      key={tx.id}
                      className="hover:bg-neutral-50/60 transition"
                    >
                      <td className="py-4 px-6 font-mono text-xs text-neutral-400">
                        #{tx.id}
                      </td>
                      <td className="py-4 px-6 font-medium text-neutral-800">
                        {tx.full_name || "—"}
                      </td>
                      <td className="py-4 px-6 text-neutral-600 max-w-[220px]">
                        <span
                          className="line-clamp-1 block"
                          title={tx.books_title}
                        >
                          {tx.books_title || "Digital Archive Access"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-neutral-500 text-xs">
                        {tx.city || "—"}
                      </td>
                      <td className="py-4 px-6 text-neutral-400 text-xs font-mono whitespace-nowrap">
                        {new Date(tx.created_at).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-4 px-6 text-right font-serif font-semibold text-neutral-900">
                        ${Number(tx.total_amount).toFixed(2)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`text-[10px] px-2.5 py-1 font-bold uppercase tracking-wider ${
                            tx.status === "completed"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : tx.status === "pending"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-12 text-center text-xs text-neutral-400 font-serif italic"
                    >
                      No transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 border border-neutral-200 hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  ← Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 ||
                      p === totalPages ||
                      Math.abs(p - currentPage) <= 1,
                  )
                  .reduce((acc: (number | string)[], p, idx, arr) => {
                    if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1)
                      acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, idx) =>
                    p === "..." ? (
                      <span
                        key={`dots-${idx}`}
                        className="px-3 py-1.5 text-neutral-300"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p as number)}
                        className={`px-3 py-1.5 border transition ${
                          currentPage === p
                            ? "bg-[#2c3e35] text-white border-[#2c3e35]"
                            : "border-neutral-200 hover:bg-neutral-50"
                        }`}
                      >
                        {p}
                      </button>
                    ),
                  )}
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 border border-neutral-200 hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
