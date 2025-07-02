import React, { useState, useEffect, useRef } from "react";
import { FaRegCalendarAlt, FaTimes } from "react-icons/fa";
import "./MemberForm.css";

const initialState = {
  member_id: "",
  first_name: "",
  last_name: "",
  whatsapp: "",
  package: "",
  join_date: "",
  expiry_date: "",
  blood_group: "",
  address: "",
  health_issues: "",
  total_amount: "",
  paid_amount: "",
  extra_details: "",
};

const generateMemberId = () => `M${Date.now()}`;

const BLOOD_GROUPS = [
  "", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"
];

const MemberForm = ({ member, onSave, onClose }) => {
  const [form, setForm] = useState(initialState);

  // Refs for date inputs
  const joinDateRef = useRef(null);
  const expiryDateRef = useRef(null);

  useEffect(() => {
    if (member) {
      let first_name = "";
      let last_name = "";
      if (member.name) {
        const parts = member.name.split(" ");
        first_name = parts[0] || "";
        last_name = parts.slice(1).join(" ") || "";
      }
      setForm({
        ...initialState,
        ...member,
        first_name,
        last_name,
        join_date: member.join_date
          ? new Date(member.join_date).toISOString().split("T")[0]
          : "",
        expiry_date: member.expiry_date
          ? new Date(member.expiry_date).toISOString().split("T")[0]
          : "",
      });
    } else {
      setForm({ ...initialState, member_id: generateMemberId() });
    }
  }, [member]);

  useEffect(() => {
    if (form.package && form.join_date && form.package !== "custom") {
      const joinDate = new Date(form.join_date);
      let expiry = new Date(joinDate);
      if (form.package === "1 month") {
        expiry.setMonth(joinDate.getMonth() + 1);
      } else if (form.package === "3 month") {
        expiry.setMonth(joinDate.getMonth() + 3);
      } else if (form.package === "6 month") {
        expiry.setMonth(joinDate.getMonth() + 6);
      } else if (form.package === "12 month") {
        expiry.setFullYear(joinDate.getFullYear() + 1);
      }
      setForm((prev) => ({
        ...prev,
        expiry_date: expiry.toISOString().split("T")[0],
      }));
    }
  }, [form.package, form.join_date]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let val = value;
    if (name === "total_amount" || name === "paid_amount") {
      val = value === "" ? "" : Number(value);
    }
    // Restrict whatsapp to 10 digits only (numbers only)
    if (name === "whatsapp") {
      // Remove non-digits and limit to 10
      val = value.replace(/\D/g, "").slice(0, 10);
    }
    setForm((prev) => ({ ...prev, [name]: val }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = `${form.first_name} ${form.last_name}`.trim();
    onSave({ ...form, name });
    onClose();
  };

  // Helper to open the date picker (showPicker is not supported in Firefox, but input click works)
  const openDatePicker = (ref) => {
    if (ref.current) {
      if (ref.current.showPicker) {
        ref.current.showPicker();
      } else {
        ref.current.focus();
        ref.current.click();
      }
    }
  };

  return (
    <div className="member-form-modal">
      <form className="member-form-container member-form-scrollable" onSubmit={handleSubmit}>
        <button 
          type="button" 
          className="close-button"
          onClick={onClose}
          title="Close"
        >
          <FaTimes />
        </button>

        <h2>{member ? "Edit Member" : "Add Member"}</h2>

        <div style={{ marginBottom: "1.2rem", color: "#28B295", fontWeight: 700, fontSize: "1.08rem" }}>
          Member Details
        </div>

        <div className="form-row-2">
          <div className="form-group">
            <label>Member ID</label>
            <input
              name="member_id"
              value={form.member_id}
              readOnly
              className="readonly"
            />
          </div>
          <div className="form-group">
            <label>WhatsApp Number</label>
            <input
              name="whatsapp"
              value={form.whatsapp}
              onChange={handleChange}
              required
              placeholder="10-digit WhatsApp/mobile number"
              pattern="^\d{10}$"
              title="Enter a valid 10-digit number"
              maxLength={10}
              inputMode="numeric"
              autoComplete="off"
            />
          </div>
        </div>

        <div className="form-row-2">
          <div className="form-group">
            <label>First Name</label>
            <input
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              required
              autoFocus
              placeholder="First name"
            />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              placeholder="Last name"
            />
          </div>
        </div>

        <div className="form-row-2">
          <div className="form-group">
            <label>Membership Package</label>
            <select
              name="package"
              value={form.package}
              onChange={handleChange}
              required
            >
              <option value="">Select package duration</option>
              <option value="1 month">1 Month</option>
              <option value="3 month">3 Months</option>
              <option value="6 month">6 Months</option>
              <option value="12 month">12 Months</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div className="form-group">
            <label>Blood Group</label>
            <select
              name="blood_group"
              value={form.blood_group}
              onChange={handleChange}
            >
              {BLOOD_GROUPS.map((bg) => (
                <option key={bg} value={bg}>
                  {bg === "" ? "Select blood group" : bg}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row-2">
          <div className="form-group date-group">
            <label>Join Date</label>
            <div className="date-input-wrapper">
              <input
                type="date"
                name="join_date"
                value={form.join_date}
                onChange={handleChange}
                required
                placeholder="dd-mm-yyyy"
                className="date-input"
                ref={joinDateRef}
              />
              <FaRegCalendarAlt
                className="calendar-icon"
                onClick={() => openDatePicker(joinDateRef)}
                style={{ cursor: "pointer", pointerEvents: "auto" }}
                title="Pick date"
              />
            </div>
          </div>
          <div className="form-group date-group">
            <label>Expiry Date</label>
            <div className="date-input-wrapper">
              <input
                type="date"
                name="expiry_date"
                value={form.expiry_date}
                onChange={handleChange}
                required
                readOnly={form.package !== "custom" && form.package !== ""}
                placeholder="dd-mm-yyyy"
                className="date-input"
                ref={expiryDateRef}
              />
              <FaRegCalendarAlt
                className="calendar-icon"
                onClick={() => openDatePicker(expiryDateRef)}
                style={{ cursor: "pointer", pointerEvents: "auto" }}
                title="Pick date"
              />
            </div>
          </div>
        </div>

        <div className="form-row-full">
          <label>Address</label>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Address"
            rows={2}
          />
        </div>
        <div className="form-row-full">
          <label>Health Issues</label>
          <textarea
            name="health_issues"
            value={form.health_issues}
            onChange={handleChange}
            placeholder="Health issues (if any)"
            rows={2}
          />
        </div>
        <div className="form-row-full">
          <label>Extra Details</label>
          <textarea
            name="extra_details"
            value={form.extra_details}
            onChange={handleChange}
            placeholder="Extra details"
            rows={2}
          />
        </div>

        <div className="payment-section">
          <div className="payment-title">Payment Details</div>
          <div className="payment-row">
            <div className="form-group">
              <label>Total Amount</label>
              <input
                type="number"
                name="total_amount"
                value={form.total_amount}
                onChange={handleChange}
                required
                min="0"
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Amount Paid</label>
              <input
                type="number"
                name="paid_amount"
                value={form.paid_amount}
                onChange={handleChange}
                required
                min="0"
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Amount Due</label>
              <input
                type="text"
                value={
                  form.total_amount && form.paid_amount
                    ? Math.max(form.total_amount - form.paid_amount, 0)
                    : ""
                }
                readOnly
                className="readonly"
                placeholder="None"
              />
            </div>
          </div>
        </div>

        <div className="form-actions form-actions-center">
          <button type="submit" className="btn btn-primary">
            💾 Save
          </button>
          <button type="button" className="btn" onClick={onClose}>
            ❌ Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default MemberForm;