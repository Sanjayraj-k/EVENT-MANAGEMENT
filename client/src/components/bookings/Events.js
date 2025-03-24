import React, { useEffect, useState } from "react";
import axios from "axios";
import LoadingSpinner from "../LoadingSpinner";
import { format, parseISO } from "date-fns";
import { differenceInMilliseconds } from "date-fns";
import { ClubList } from "../Institutions";
import "../../hallbook.css";
import Popup from "./popup";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import CertificateGeneration from "./CertificateGenerator";

// Add this CSS to your stylesheet or include it in the component
const timerStyle = `
  @keyframes colorChange {
    0% { color: #ff4d4d; }
    50% { color: #4d4dff; }
    100% { color: #4dff4d; }
  }
  
  .countdown-timer {
    font-size: 1.2rem;
    font-weight: bold;
    animation: colorChange 2s infinite alternate;
  }
`;

const Events = () => {
  const [eventData, setEventData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [eventTypeFilter, setEventTypeFilter] = useState("all");
  const [showCertificate, setShowCertificate] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  const handleButtonClick = () => {
    setShowCertificate(true);
  };

  const navigate = useNavigate();

  const handleViewClick = (bookingId) => {
    navigate(`/bookingevent/${bookingId}`);
  };

  const handleNavigate = () => {
    navigate('/certificategenerator', { state: { eventData } });
  };

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  let CulturalName = searchParams.get("CulturalName");
  if (!CulturalName) {
    CulturalName = "All Cultural";
  }

  const getEventData = async () => {
    try {
      const response = await axios.get(`https://event-management-react-1.onrender.com/events`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (response.status !== 200) {
        throw new Error(`Error fetching events: ${response.status}`);
      }

      const data = response.data.bookings;

      const sortedEventData = data.sort((a, b) => {
        return new Date(a.eventDate || a.eventStartDate) - new Date(b.eventDate || b.eventStartDate);
      });

      // Initialize countdown for each event
      const eventsWithCountdown = sortedEventData.map(event => ({
        ...event, 
        countdown: calculateCountdown(event.eventDate || event.eventStartDate)
      }));

      setEventData(eventsWithCountdown);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch event data:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getEventData();
    const intervalId = setInterval(() => {
      setEventData((prevEventData) => prevEventData.map(event => ({
        ...event, 
        countdown: calculateCountdown(event.eventDate || event.eventStartDate)
      })));
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const calculateCountdown = (eventDate) => {
    if (!eventDate) return "Date not specified";
    
    const currentDate = new Date();
    const timeDifference = differenceInMilliseconds(new Date(eventDate), currentDate);
    if (timeDifference <= 0) {
      return "Event has passed";
    }
    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  const handleFilterChange = (filter) => {
    setEventTypeFilter(filter);
    setActiveFilter(filter);
  };

  const filteredEventData = eventData.filter((event) => {
    const eventDate = new Date(event.eventDate || event.eventStartDate);
    const currentDate = new Date();
    return (
      (eventDate >= currentDate || !eventDate) && 
      (eventTypeFilter === "all" || event.eventType === eventTypeFilter)
    );
  });

  // Common button style
  const buttonStyle = (isActive) => ({
    backgroundColor: isActive ? '#4b5f47' : '#6d7f69',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.3s, transform 0.3s',
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
    margin: '0 8px',
    transform: isActive ? 'scale(1.05)' : 'scale(1)',
  });

  return (
    <>
      <style>{timerStyle}</style>
      <div className="mt-6 min-h-screen relative">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center w-50"
          style={{
            backgroundImage: 'url("event_bg.jpeg")',
            backgroundAttachment: "fixed",
          }}
        >
          <div className="flex flex-wrap justify-center p-4">
            <button
              style={buttonStyle(activeFilter === "all")}
              onClick={() => handleFilterChange("all")}
            >
              All
            </button>
            <button
              style={buttonStyle(activeFilter === "technical")}
              onClick={() => handleFilterChange("technical")}
            >
              Technical
            </button>
            <button
              style={buttonStyle(activeFilter === "non-technical")}
              onClick={() => handleFilterChange("non-technical")}
            >
              Non-Technical
            </button>
            <button
              style={buttonStyle(activeFilter === "workshop")}
              onClick={() => handleFilterChange("workshop")}
            >
              Workshop
            </button>
            
            <button 
              style={{
                ...buttonStyle(false),
                backgroundColor: '#8A2BE2',
                marginLeft: '20px'
              }}
              onClick={handleButtonClick}
            >
              Generate Certificate
            </button>
            
            <button 
              style={{
                ...buttonStyle(false),
                backgroundColor: '#2E8B57',
                marginLeft: '10px'
              }}
              onClick={handleNavigate}
            >
              
              Show Event Rules
            </button>
          </div>
        </div>
        <br />
        <br />
        <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-3xl xl:text-3xl text-center text-gray-800 font-black leading-7 ml-3 md:leading-10 relative z-10">
          Upcoming<span style={{ color: "#6d7f69" }}> Events </span> for{" "}
          {CulturalName}
        </h1>
      
        {isLoading ? (
          <LoadingSpinner />
        ) : filteredEventData.length ? (
          filteredEventData.map((event) => (
            <React.Fragment key={event._id}>
              {"All Cultural" === CulturalName ||
              event.organizingClub === CulturalName ? (
                <div className="flex flex-col justify-center items-center my-10">
                  <div className="relative flex flex-col items-center mx-auto rounded-xl p-8 md:w-8/12 lg:w-10/12 bg-white">
                    <div
                      className="absolute inset-0 z-0 bg-cover bg-center rounded-xl"
                      style={{
                        backgroundImage: 'url("event_card_2.jpeg")',
                      }}
                    ></div>
                    <div className="mt-8 mb-8 w-full relative">
                      <h4 className="px-2 text-2xl font-bold text-navy-500">
                        {event.eventName}
                      </h4>
                    </div>
                    <div className="grid grid-cols-3 max-md:grid-cols-1 gap-4 px-2 w-full relative">
                      <div className="flex flex-col items-start justify-center rounded-2xl bg-white bg-clip-border px-3 py-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
                        <p className="text-m font-bold text-gray-600">
                          Event Venue
                        </p>
                        <p className="text-base font-medium text-navy-700">
                          {event.bookedHallName}
                        </p>
                      </div>

                      <div className="flex flex-col justify-center rounded-2xl bg-white bg-clip-border px-3 py-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
                        <p className="text-m font-bold text-gray-600">
                          Location
                        </p>
                        <p className="text-base font-medium text-navy-700">
                          {event.bookedHall && event.bookedHall.location ? event.bookedHall.location : "Location not specified"}
                        </p>
                      </div>

                      <div className="flex flex-col items-start justify-center rounded-2xl bg-white bg-clip-border px-3 py-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
                        <p className="text-m font-bold text-gray-600">
                          Cultural Name
                        </p>
                        <p className="text-base font-medium text-navy-700">
                          {event.organizingClub}
                        </p>
                      </div>

                      <div className="flex flex-col items-start justify-center rounded-2xl bg-white bg-clip-border px-3 py-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
                        <p className="text-m font-bold text-gray-600">
                          Event Date Type
                        </p>
                        <p className="text-base font-medium text-navy-700">
                          {event.eventDateType === "multiple"
                            ? "Multiple Days"
                            : event.eventDateType === "half"
                            ? "Half Day"
                            : "Full Day"}
                        </p>
                      </div>

                      <div className="flex flex-col items-start justify-center rounded-2xl bg-white bg-clip-border px-3 py-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
                        <p className="text-m font-bold text-gray-600">
                          Time Remaining
                        </p>
                        <p className="countdown-timer">
                          {event.countdown}
                        </p>
                      </div>

                      {(event.eventDateType === "full" ||
                        event.eventDateType === "half") && (
                        <div className="flex flex-col justify-center rounded-2xl bg-white bg-clip-border px-3 py-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
                          <p className="text-m font-bold text-gray-600">
                            Event Date
                          </p>
                          <p className="text-base font-medium text-navy-700">
                            {event.eventDate ? format(
                              new Date(event.eventDate),
                              "EEEE dd-MM-yyyy"
                            ) : "Date not specified"}
                          </p>
                        </div>
                      )}

                      {event.eventDateType === "half" && (
                        <>
                          <div className="flex flex-col items-start justify-center rounded-2xl bg-white bg-clip-border px-3 py-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
                            <p className="text-m font-bold text-gray-600">
                              Starts At
                            </p>
                            <p className="text-base font-medium text-navy-700">
                              {event.startTime ? format(
                                parseISO(event.startTime.replace('Z', '')),
                                "hh:mm aa"
                              ) : "Time not specified"}
                            </p>
                          </div>

                          <div className="flex flex-col justify-center rounded-2xl bg-white bg-clip-border px-3 py-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
                            <p className="text-m font-bold text-gray-600">
                              Ends At
                            </p>
                            <p className="text-base font-medium text-navy-700">
                              {event.endTime ? format(
                                parseISO(event.endTime.replace('Z', '')),
                                "hh:mm aa"
                              ) : "Time not specified"}
                            </p>
                          </div>
                        </>
                      )}

                      {event.eventDateType === "multiple" && (
                        <>
                          <div className="flex flex-col justify-center rounded-2xl bg-white bg-clip-border px-3 py-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
                            <p className="text-m font-bold text-gray-600">
                              Event Start Date
                            </p>
                            <p className="text-base font-medium text-navy-700">
                              {event.eventStartDate ? format(
                                new Date(event.eventStartDate),
                                "EEEE dd-MM-yyyy"
                              ) : "Start date not specified"}
                            </p>
                          </div>

                          <div className="flex flex-col justify-center rounded-2xl bg-white bg-clip-border px-3 py-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
                            <p className="text-m font-bold text-gray-600">
                              Event End Date
                            </p>
                            <p className="text-base font-medium text-navy-700">
                              {event.eventEndDate ? format(
                                new Date(event.eventEndDate),
                                "EEEE dd-MM-yyyy"
                              ) : "End date not specified"}
                            </p>
                          </div>
                        </>
                      )}

<div className="flex flex-col items-start justify-center rounded-2xl bg-white bg-clip-border px-3 py-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
                        <p className="text-m font-bold text-gray-600">
                          Event Coordinator
                        </p>
                        <p className="text-base font-medium text-navy-700">
                          {event.eventManager}
                        </p>
                      </div>

                      <div className="flex flex-col items-start justify-center rounded-2xl bg-white bg-clip-border px-3 py-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
                        <p className="text-m font-bold text-gray-600">
                          Club Name
                        </p>
                        <p className="text-base font-medium text-navy-700">
                          {event.department} - {ClubList[event.department] || event.department}
                        </p>
                      </div>

                      <div className="flex flex-col justify-center rounded-2xl bg-white bg-clip-border px-3 py-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
                        <p className="text-m font-bold text-gray-600">Phone</p>
                        <p className="text-base font-medium text-navy-700">
                          {event.phoneNumber}
                        </p>
                      </div>

                      <div className="flex flex-col justify-center rounded-2xl bg-white bg-clip-border px-3 py-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
                        <p className="text-m font-bold text-gray-600">
                          Registration Amount
                        </p>
                        <p className="text-base font-medium text-navy-700">
                          ₹{event.regamt}
                        </p>
                      </div>

                      <div className="flex flex-col justify-center rounded-2xl bg-white bg-clip-border px-3 py-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
                        <p className="text-m font-bold text-gray-600">
                          Event Rule
                        </p>
                        <Popup event={event}/>
                      </div>

                      <div className="flex flex-col justify-center rounded-2xl bg-white bg-clip-border px-3 py-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
                        <button
                          style={{ 
                            backgroundColor: '#6d7f69',
                            color: 'white',
                            padding: '10px',
                            borderRadius: '4px',
                            border: 'none',
                            cursor: 'pointer',
                            width: "100%",
                            fontWeight: "600",
                            transition: "all 0.3s ease"
                          }}
                          className="hover:bg-gray-900 focus:bg-gray-900 focus:outline-none"
                          onClick={() => handleViewClick(event._id)}
                        >
                          Book Event
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </React.Fragment>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-64">
            <h2 className="text-2xl font-bold text-zinc-700 text-center mt-10">
              No Upcoming Events
            </h2>
            <p className="text-gray-500 mt-2">Check back later for new events</p>
          </div>
        )}

        {showCertificate && <CertificateGeneration eventData={eventData} />}
      </div>
    </>
  );
};

export default Events;