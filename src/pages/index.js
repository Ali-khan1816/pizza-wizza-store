// Last edited by you@example.com @ 23/09/26 13:13.
// src/pages/index.js

import Card from "@/components/home/Card";
import CarouselComponent from "@/components/home/CarouselComponent";
import { useEffect, useState } from "react";

export default function Home() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch food data on the client
  useEffect(() => {
    const fetchFoodData = async () => {
      try {
        const res = await fetch("/api/foodData");

        if (!res.ok) {
          throw new Error("Failed to fetch food data");
        }

        const json = await res.json();
        setData(json.data || []);
      } catch (error) {
        console.error("Food data fetch error:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFoodData();
  }, []);

  const allFood = data || [];

  const filteredFood = allFood
    .filter((item) => (typeFilter ? item.foodType === typeFilter : true))
    .filter((item) =>
      searchQuery
        ? item.name.toLowerCase().includes(searchQuery.toLowerCase())
        : true,
    );

  const categories = [...new Set(allFood.map((item) => item.category))];

  const btnClass = (active) =>
    `border-black rounded-full dark:border-white border-2 px-3 py-1 transition-colors${
      active ? " bg-slate-300 dark:bg-slate-600" : ""
    }`;

  return (
    <>
      <CarouselComponent />

      <div className="container mx-auto px-4">
        <div className="my-5 flex flex-col sm:flex-row items-center gap-4">
          {/* Search */}
          <div className="relative w-full sm:max-w-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>

            <input
              type="text"
              placeholder="Search pizzas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-indigo-500 text-sm"
            />

            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Food Type Filter */}
          <div className="flex items-center gap-3">
            <button
              className={btnClass(!typeFilter)}
              onClick={() => setTypeFilter(false)}
            >
              All
            </button>

            <button
              className={btnClass(typeFilter === "Veg")}
              onClick={() => setTypeFilter("Veg")}
            >
              <span className="lowercase font-thin bg-white border-green-500 border mr-2 px-0.5 text-green-500">
                ●
              </span>
              Veg
            </button>

            <button
              className={btnClass(typeFilter === "Non-Veg")}
              onClick={() => setTypeFilter("Non-Veg")}
            >
              <span className="lowercase font-thin bg-white border-red-500 border mr-2 px-0.5 text-red-500">
                ●
              </span>
              Non Veg
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-xl">Loading...</p>
          </div>
        ) : searchQuery ? (
          <>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {filteredFood.length} result
              {filteredFood.length !== 1 ? "s" : ""} for "
              <strong>{searchQuery}</strong>"
            </p>

            {filteredFood.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <p className="text-xl">No results found</p>
                <p className="text-sm mt-2">Try a different search term</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mx-auto mb-10">
                {filteredFood.map((item) => (
                  <Card key={item._id} foodData={item} />
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {categories.map((category) => {
              const filtered = allFood
                .filter((item) => item.category === category)
                .filter((item) =>
                  typeFilter ? item.foodType === typeFilter : true,
                );

              if (filtered.length === 0) return null;

              return (
                <div key={category}>
                  <div className="mt-10 text-4xl mb-4 font-bold uppercase">
                    {category}
                  </div>

                  <hr />

                  <div className="flex flex-col items-center justify-center">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mx-auto">
                      {filtered.map((item) => (
                        <Card key={item._id} foodData={item} />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}

            {allFood.length === 0 && (
              <div className="text-center py-20 text-gray-500">
                <p className="text-xl">No items found</p>
                <p className="text-sm mt-2">Add items from the Admin panel</p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
