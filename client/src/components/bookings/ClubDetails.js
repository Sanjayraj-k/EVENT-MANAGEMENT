import React, { useState, useEffect } from "react";
import axios from "axios";
import { institutions } from "../Institutions";

const AllClubs = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [culturalLists, setCulturalLists] = useState([]);

  const getEventData = async () => {
    try {
      const response = await axios.get(
        `https://event-management-react-1.onrender.com/events`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data.bookings;
      console.log("data", data);

      const culturalList = data.map((event) => event.organizingClub);
      console.log("cultural list", culturalList);

      setCulturalLists([...new Set(culturalList)]); // Remove duplicates
      setIsLoading(false);

      if (response.status !== 200) {
        throw new Error(response.status);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    getEventData();
  }, []);

  const navigateToEventPage = (CulturalName) => {
    window.location.href = `/events?CulturalName=${CulturalName}`;
  };

  return (
    <div className="container mx-auto p-6">
      <style>
        {`
          @keyframes rainbow {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          .rainbow-text {
            background-image: linear-gradient(
              45deg,
              red, orange, yellow, green, blue, indigo, violet
            );
            background-size: 400% 400%;
            animation: rainbow 6s infinite linear;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-weight: bold;
            font-family: "Comic Sans MS", cursive, sans-serif;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
            letter-spacing: 1.5px;
          }

          .club-card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }

          .club-card:hover {
            transform: scale(1.05);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
          }
        `}
      </style>

      <h2 className="text-center text-3xl font-extrabold mb-6">
        All Cultural Clubs 🎭
      </h2>

      {institutions.slice(0, 1).map((institution, index) => (
        <div key={index}>
          <h3 className="text-center text-xl font-semibold mb-4">
            {institution.name} Cultural
          </h3>

          {/* Grid for proper alignment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-center items-start">
            {culturalLists.map((Cultural, index) => (
              <div
                key={index}
                onClick={() => navigateToEventPage(Cultural)}
                className="club-card cursor-pointer bg-white p-4 rounded-lg shadow-md text-center hover:shadow-lg transition-all w-full max-w-xs border border-gray-300"
              >
                {/* Rainbow Gradient Text with Font Styling */}
                <span className="text-lg rainbow-text">{Cultural}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AllClubs;
