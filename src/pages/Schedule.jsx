import React, { useState, useRef, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import axios from "axios";
import "./Schedule.css";
import { FaCalendarAlt, FaPlus, FaUndo, FaTrash, FaFilePdf, FaFilter, FaEdit, FaClock, FaTimes } from "react-icons/fa";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const times = [
  "6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM",
  "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM",
  "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM"
];

const categoryLimits = {
  Yoga: 5,
  Zumba: 5,
  "Personal Training": 3,
  Cardio: 4,
  Strength: 4,
};

const Schedule = () => {
  const [bookings, setBookings] = useState({});
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [form, setForm] = useState({ member: "", category: "Yoga", trainer: "" });
  const [members, setMembers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [newMember, setNewMember] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [reminder, setReminder] = useState("");
  const [lastBooking, setLastBooking] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const [filters, setFilters] = useState({ member: "", category: "", trainer: "" });
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Custom schedule modal state
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customForm, setCustomForm] = useState({
    member: "",
    category: "Yoga",
    trainer: "",
    session_start: "",
    session_end: "",
  });

  const scheduleRef = useRef();

  useEffect(() => {
    fetchMembers();
    fetchBookings();
    fetchTrainers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await axios.get("https://solsparrow-backend.onrender.com/api/members");
      setMembers(res.data.map(m => m.name));
    } catch (err) {
      setErrorMessage("Failed to fetch members");
    }
  };

  const fetchTrainers = async () => {
    try {
      const res = await axios.get("https://solsparrow-backend.onrender.com/api/staff");
      setTrainers(res.data);
    } catch (err) {
      setErrorMessage("Failed to fetch trainers");
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://solsparrow-backend.onrender.com/api/schedule");
      setBookings(res.data);
    } catch (err) {
      setErrorMessage("Failed to fetch schedule");
    } finally {
      setLoading(false);
    }
  };

  const handleSlotClick = (day, time) => {
    setSelectedSlot({ day, time });
    setForm({ member: "", category: "Yoga", trainer: "" });
    setEditIndex(null);
    setReminder(`Don't forget to assign trainer and confirm category.`);
  };

  const handleInputChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Custom schedule input change
  const handleCustomInputChange = (e) => {
    setCustomForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleBookingSubmit = async () => {
    if (!selectedSlot || !form.member) {
      setErrorMessage("Please select a member");
      return;
    }

    const key = `${selectedSlot.day}-${selectedSlot.time}`;
    const slotBookings = bookings[key] || [];
    const categoryCount = slotBookings.filter(b => b.category === form.category).length;

    if (categoryCount >= categoryLimits[form.category] && editIndex === null) {
      setErrorMessage(`Limit reached for ${form.category} in this slot.`);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      if (editIndex !== null) {
        // Update existing booking
        const bookingToUpdate = slotBookings[editIndex];
        await axios.put(`https://solsparrow-backend.onrender.com/api/schedule/${bookingToUpdate.id}`, {
          day: selectedSlot.day,
          time: selectedSlot.time,
          ...form,
        });

        const updatedSlotBookings = [...slotBookings];
        updatedSlotBookings[editIndex] = { ...bookingToUpdate, ...form };
        const updatedBookings = { ...bookings, [key]: updatedSlotBookings };
        setBookings(updatedBookings);

        setSuccessMessage(`Booking updated for ${form.member} in ${form.category}`);
      } else {
        // Create new booking
        const res = await axios.post("https://solsparrow-backend.onrender.com/api/schedule", {
          day: selectedSlot.day,
          time: selectedSlot.time,
          ...form,
        });

        const newBooking = { id: res.data.id, ...form };
        const updatedSlotBookings = [...slotBookings, newBooking];
        const updatedBookings = { ...bookings, [key]: updatedSlotBookings };
        setBookings(updatedBookings);
        setLastBooking({ key, booking: newBooking });

        setSuccessMessage(`Booking successful for ${form.member} in ${form.category}`);
      }

      setForm({ member: "", category: "Yoga", trainer: "" });
      setSelectedSlot(null);
      setEditIndex(null);
      setReminder("");
    } catch (err) {
      setErrorMessage("Failed to save booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Custom schedule submit
  const handleCustomScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!customForm.member || !customForm.category || !customForm.trainer || !customForm.session_start || !customForm.session_end) {
      setErrorMessage("Please fill all fields for custom schedule.");
      return;
    }
    try {
      setLoading(true);
      setErrorMessage("");
      // Save as a booking with extra fields
      await axios.post("https://solsparrow-backend.onrender.com/api/schedule/custom", {
        ...customForm,
      });
      setSuccessMessage("Custom schedule added successfully");
      setShowCustomModal(false);
      setCustomForm({
        member: "",
        category: "Yoga",
        trainer: "",
        session_start: "",
        session_end: "",
      });
      fetchBookings();
    } catch (err) {
      setErrorMessage("Failed to add custom schedule");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!newMember.trim()) {
      setErrorMessage("Please enter a member name");
      return;
    }

    if (members.includes(newMember)) {
      setErrorMessage("Member already exists");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      await axios.post("https://solsparrow-backend.onrender.com/api/members", { name: newMember });
      setMembers([...members, newMember]);
      setNewMember("");
      setSuccessMessage("Member added successfully");
    } catch (err) {
      setErrorMessage("Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setLoading(true);
      const input = scheduleRef.current;
      const canvas = await html2canvas(input);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("landscape", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("Weekly_Schedule.pdf");
      setSuccessMessage("PDF exported successfully");
    } catch (err) {
      setErrorMessage("Failed to export PDF");
    } finally {
      setLoading(false);
    }
  };

  const handleEditBooking = (day, time, index) => {
    const key = `${day}-${time}`;
    const booking = bookings[key][index];
    setSelectedSlot({ day, time });
    setForm(booking);
    setEditIndex(index);
  };

  const handleUndo = async () => {
    if (!lastBooking) {
      setErrorMessage("Nothing to undo");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      await axios.delete(`https://solsparrow-backend.onrender.com/api/schedule/${lastBooking.booking.id}`);
      const { key, booking } = lastBooking;
      const updated = bookings[key].filter(b => b.id !== booking.id);
      const updatedBookings = { ...bookings, [key]: updated };
      setBookings(updatedBookings);
      setLastBooking(null);
      setSuccessMessage("Last booking undone successfully");
    } catch (err) {
      setErrorMessage("Failed to undo booking");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Are you sure you want to clear the entire schedule?")) {
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      await axios.delete("https://solsparrow-backend.onrender.com/api/schedule");
      setBookings({});
      setLastBooking(null);
      setSuccessMessage("Schedule reset successfully");
    } catch (err) {
      setErrorMessage("Failed to reset schedule");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBooking = async (day, time, index) => {
    const key = `${day}-${time}`;
    const booking = bookings[key][index];

    if (!window.confirm(`Are you sure you want to delete ${booking.member}'s booking?`)) {
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      await axios.delete(`https://solsparrow-backend.onrender.com/api/schedule/${booking.id}`);

      const updated = bookings[key].filter((_, idx) => idx !== index);
      const updatedBookings = { ...bookings, [key]: updated };
      setBookings(updatedBookings);

      setSuccessMessage("Booking deleted successfully");
    } catch (err) {
      setErrorMessage("Failed to delete booking");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const closeCustomModal = () => {
    setShowCustomModal(false);
    setCustomForm({
      member: "",
      category: "Yoga",
      trainer: "",
      session_start: "",
      session_end: "",
    });
  };

  const closeBookingModal = () => {
    setSelectedSlot(null);
    setForm({ member: "", category: "Yoga", trainer: "" });
    setEditIndex(null);
    setReminder("");
  };

  const renderBookings = (day, time) => {
    const key = `${day}-${time}`;
    const slotBookings = (bookings[key] || []).filter(booking => {
      const memberMatch = !filters.member || booking.member === filters.member;
      const categoryMatch = !filters.category || booking.category === filters.category;
      const trainerMatch = !filters.trainer || booking.trainer === filters.trainer;
      return memberMatch && categoryMatch && trainerMatch;
    });

    if (slotBookings.length === 0) return null;

    const summaryText = `${slotBookings.length} booking${slotBookings.length > 1 ? 's' : ''}`;

    return (
      <details className="slot-bookings">
        <summary>{summaryText}</summary>
        <ul>
          {slotBookings.map((booking, index) => (
            <li key={index} className={`booking-cat-${booking.category.toLowerCase().replace(' ', '-')}`}>
              <strong>{booking.member}</strong> ({booking.category})
              <br />
              Trainer: {booking.trainer}
              <div className="booking-actions">
                <button onClick={() => handleEditBooking(day, time, index)}><FaEdit /></button>
                <button onClick={() => handleDeleteBooking(day, time, index)}><FaTrash /></button>
              </div>
            </li>
          ))}
        </ul>
      </details>
    );
  };

  return (
    <div className="schedule-page">
      <div className="schedule-wrapper">
        {/* Hero Section */}
        <div className="hero-section">
          <div className="hero-content">
            <h1>Class Schedule</h1>
            <p>Manage and view all class bookings, trainer assignments, and member schedules.</p>
          </div>
          <div className="hero-actions">
            <button className="btn btn-secondary" onClick={handleExportPDF} disabled={loading}>
              <FaFilePdf /> Export PDF
            </button>
            <button className="btn" onClick={() => setShowFilters(!showFilters)}>
              <FaFilter /> {showFilters ? "Hide" : "Show"} Filters
            </button>
          </div>
        </div>

        {successMessage && <div className="success-msg">{successMessage}</div>}
        {errorMessage && <div className="error-msg">{errorMessage}</div>}
        {loading && <div className="loading-msg">Loading...</div>}

        {showFilters && (
          <div className="filters-section">
            <h3 className="filters-title">Filter Bookings</h3>
            <div className="filters-container">
              <div className="filter-item">
                <label htmlFor="memberFilter">By Member</label>
                <select id="memberFilter" name="member" value={filters.member} onChange={handleFilterChange}>
                  <option value="">All Members</option>
                  {members.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="filter-item">
                <label htmlFor="categoryFilter">By Category</label>
                <select id="categoryFilter" name="category" value={filters.category} onChange={handleFilterChange}>
                  <option value="">All Categories</option>
                  {Object.keys(categoryLimits).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="filter-item">
                <label htmlFor="trainerFilter">By Trainer</label>
                <select id="trainerFilter" name="trainer" value={filters.trainer} onChange={handleFilterChange}>
                  <option value="">All Trainers</option>
                  {trainers.map((trainer) => <option key={trainer.id} value={trainer.name}>{trainer.name}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="schedule-actions" style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <button className="btn" onClick={handleUndo} disabled={!lastBooking || loading}>
            <FaUndo /> Undo Last
          </button>
          <button className="btn btn-danger" onClick={handleReset} disabled={loading}>
            <FaTrash /> Reset Schedule
          </button>
          <button
            className="btn"
            style={{ marginLeft: "auto" }}
            onClick={() => setShowCustomModal(true)}
          >
            <FaClock /> Custom Schedule
          </button>
        </div>

        <div className="calendar" ref={scheduleRef}>
          <div className="time-header">Time</div>
          {days.map((day) => (
            <div key={day} className="calendar-day">{day}</div>
          ))}

          {times.map((time) => (
            <React.Fragment key={time}>
              <div className="time-slot-label">{time}</div>
              {days.map((day) => {
                const key = `${day}-${time}`;
                const hasBooking = (bookings[key] || []).length > 0;
                return (
                  <div
                    key={`${day}-${time}`}
                    className="slot-cell"
                    onClick={() => handleSlotClick(day, time)}
                  >
                    {hasBooking ? (
                      renderBookings(day, time)
                    ) : (
                      <span className="plus-sign"><FaPlus /></span>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>

        {/* Custom Schedule Modal */}
        {showCustomModal && (
          <div className="modal-overlay">
            <div className="booking-modal" style={{ position: 'relative' }}>
              <button 
                onClick={closeCustomModal}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'none',
                  border: 'none',
                  fontSize: '18px',
                  cursor: 'pointer',
                  color: '#666',
                  padding: '5px',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  zIndex: '10',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f0f0f0';
                  e.target.style.color = '#333';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#666';
                }}
              >
                <FaTimes />
              </button>
              <h3>Custom Schedule</h3>
              <form onSubmit={handleCustomScheduleSubmit}>
                <div className="form-group">
                  <label>Member</label>
                  <select name="member" value={customForm.member} onChange={handleCustomInputChange} required>
                    <option value="">Select Member</option>
                    {members.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select name="category" value={customForm.category} onChange={handleCustomInputChange} required>
                    {Object.keys(categoryLimits).map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Trainer</label>
                  <select name="trainer" value={customForm.trainer} onChange={handleCustomInputChange} required>
                    <option value="">Select Trainer</option>
                    {trainers.map((trainer) => <option key={trainer.id} value={trainer.name}>{trainer.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Session Start Time</label>
                  <input
                    type="datetime-local"
                    name="session_start"
                    value={customForm.session_start}
                    onChange={handleCustomInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Session End Time</label>
                  <input
                    type="datetime-local"
                    name="session_end"
                    value={customForm.session_end}
                    onChange={handleCustomInputChange}
                    required
                  />
                </div>
                <div className="modal-actions">
                  <button type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Add Custom Schedule"}
                  </button>
                  <button type="button" className="btn-cancel" onClick={closeCustomModal}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {selectedSlot && (
          <div className="modal-overlay">
            <div className="booking-modal" style={{ position: 'relative' }}>
              <button 
                onClick={closeBookingModal}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'none',
                  border: 'none',
                  fontSize: '18px',
                  cursor: 'pointer',
                  color: '#666',
                  padding: '5px',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  zIndex: '10',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f0f0f0';
                  e.target.style.color = '#333';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#666';
                }}
              >
                <FaTimes />
              </button>
              <h3>{editIndex !== null ? "Edit Booking" : "New Booking"}</h3>
              <p>{`Scheduling for ${selectedSlot.day} at ${selectedSlot.time}`}</p>
              {reminder && <div className="reminder-msg">{reminder}</div>}

              <div className="form-group">
                <label>Member</label>
                <select name="member" value={form.member} onChange={handleInputChange}>
                  <option value="">Select Member</option>
                  {members.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Add New Member</label>
                <div className="input-with-button">
                  <input type="text" value={newMember} onChange={(e) => setNewMember(e.target.value)} placeholder="Enter new member name" />
                  <button onClick={handleAddMember} disabled={loading}><FaPlus /></button>
                </div>
              </div>

              <div className="form-group">
                <label>Category</label>
                <select name="category" value={form.category} onChange={handleInputChange}>
                  {Object.keys(categoryLimits).map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Trainer</label>
                <select name="trainer" value={form.trainer} onChange={handleInputChange}>
                  <option value="">Select Trainer</option>
                  {trainers.map((trainer) => <option key={trainer.id} value={trainer.name}>{trainer.name}</option>)}
                </select>
              </div>

              <div className="modal-actions">
                <button onClick={handleBookingSubmit} disabled={loading || !form.member}>
                  {loading ? "Saving..." : (editIndex !== null ? "Update Booking" : "Confirm Booking")}
                </button>
                <button className="btn-cancel" onClick={closeBookingModal}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Schedule;