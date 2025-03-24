import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LoadingSpinner from "../LoadingSpinner";

const Halls = () => {
  const navigate = useNavigate();
  const [originalHalls, setOriginalHalls] = useState([]);
  const [filteredHalls, setFilteredHalls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("default");

  const getHallsData = async () => {
    try {
      const response = await axios.get(
        `https://event-management-react-1.onrender.com/halls`,
        {
          withCredentials: true,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      const data = response.data;
      setOriginalHalls(data.halls);
      setFilteredHalls(data.halls);
      setIsLoading(false);
    } catch (error) {
      navigate("/login");
    }
  };

  useEffect(() => {
    getHallsData();
  }, []);

  const handleInputChange = (event) => {
    setSearchQuery(event.target.value);
    filterHalls(event.target.value, sortOrder);
  };

  const filterHalls = (query, order) => {
    let filtered = originalHalls.filter((hall) =>
      hall.name.toLowerCase().startsWith(query.toLowerCase()) ||
      hall.name.toLowerCase().includes(query.toLowerCase())
    );

    if (order !== "default") {
      filtered = sortHalls(filtered, order);
    }

    setFilteredHalls(filtered);
  };

  const handleSortChange = () => {
    const order = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(order);
    setFilteredHalls(sortHalls(filteredHalls, order));
  };

  const sortHalls = (halls, order) => {
    if (order === "asc") {
      return [...halls].sort((a, b) => a.capacity - b.capacity);
    } else if (order === "desc") {
      return [...halls].sort((a, b) => b.capacity - a.capacity);
    }
    return halls;
  };

  const handleBookingClick = (hallId, hallName) => {
    navigate(`/bookingForm/${hallId}/${hallName}`);
  };

  return (
    <>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="mt-6 min-h-screen">
          {/* Search and Sort Container */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "10px",
              marginBottom: "30px",
            }}
          >
            <input
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              placeholder="Search by Hall Name"
              style={{
                padding: "8px",
                borderRadius: "5px",
                border: "2px solid #333",
                width: "250px",
              }}
            />
            <button
              onClick={handleSortChange}
              style={{
                padding: "8px 12px",
                borderRadius: "5px",
                border: "none",
                backgroundColor: "#007bff",
                color: "white",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Sort by Capacity ({sortOrder === "asc" ? "Ascending" : "Descending"})
            </button>
          </div>

          <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-3xl xl:text-3xl text-center text-gray-800 font-black leading-7 ml-3 md:leading-10">
            Available <span style={{ color: "#6d7f69" }}> Halls</span>
          </h1>

          {filteredHalls.length > 0 ? (
            filteredHalls.map((hall) => (
              <div key={hall._id} className="my-2">
                <div className="flex w-full items-center justify-center">
                  <div className="w-full rounded-xl p-12 shadow-2xl shadow-blue-200 md:w-8/12 lg:w-8/12 bg-white">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                      <div className="col-span-1 lg:col-span-9">
                        <div className="text-center lg:text-left">
                          <h2 className="text-2xl font-bold text-zinc-700">
                            {hall.name}
                          </h2>
                        </div>
                        <div className="mt-6 grid grid-cols-2 gap-6 text-center lg:text-left">
                          <div>
                            <p className="font-bold text-zinc-700">Location</p>
                          </div>
                          <div>
                            <p className="text-m font-semibold text-zinc-700">
                              {hall.location}
                            </p>
                          </div>
                        </div>
                        <div className="mt-6 grid grid-cols-2 gap-6 text-center lg:text-left">
                          <div>
                            <p className="font-bold text-zinc-700">Capacity</p>
                          </div>
                          <div>
                            <p className="text-m font-semibold text-zinc-700">
                              {hall.capacity}
                            </p>
                          </div>
                        </div>
                        <div className="mt-6 grid grid-cols-2 gap-6 text-center lg:text-left">
                          <div>
                            <p className="font-bold text-zinc-700">Amenities</p>
                          </div>
                          <div>
                            <p className="text-m font-semibold text-zinc-700">
                              {hall.amenities}
                            </p>
                          </div>
                        </div>
                        <div className="mt-6 grid grid-cols-2 gap-4">
                          <button
                            className="w-full rounded-xl border-2 border-blue-500 bg-white px-3 py-2 font-semibold text-blue-500 hover:bg-blue-500 hover:text-white"
                            onClick={() =>
                              handleBookingClick(hall._id, hall.name)
                            }
                          >
                            Book Hall
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <h2 className="text-2xl font-bold text-zinc-700 text-center mt-10">
              No halls found.
            </h2>
          )}
        </div>
      )}
    </>
  );
};

export default Halls;
