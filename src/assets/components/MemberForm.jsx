import React, { useState, useEffect } from "react";

const generateMemberId = () => `M${Date.now()}`;

const initialData = {
  member_id: "",
  name: "",
  whatsapp: "",
  package: "",
  join_date: "",
  expiry_date: "",
  address: "",
  health_issues: "",
  blood_group: "",
  total_amount: 0,
  paid_amount: 0,
  extra_details: "",
};

const MemberForm = ({ member, onSave, onClose }) => {
  const [data, setData] = useState(member || initialData);

  // Set initial data: existing member or new member with generated ID
  useEffect(() => {
    if (member) {
      setData({
        ...member,
        join_date: member.join_date ? new Date(member.join_date).toISOString().split("T")[0] : "",
        expiry_date: member.expiry_date ? new Date(member.expiry_date).toISOString().split("T")[0] : "",
      });
    } else {
      setData({ ...initialData, member_id: generateMemberId() });
    }
  }, [member]);

  // Auto-calculate expiry_date when package and join_date are set
  useEffect(() => {
    if (data.package && data.join_date && data.package !== "custom") {
      const joinDate = new Date(data.join_date);
      let expiry = new Date(joinDate);
      if (data.package === "1 month") {
        expiry.setMonth(joinDate.getMonth() + 1);
      } else if (data.package === "3 month") {
        expiry.setMonth(joinDate.getMonth() + 3);
      } else if (data.package === "6 month") {
        expiry.setMonth(joinDate.getMonth() + 6);
      } else if (data.package === "12 month") {
        expiry.setFullYear(joinDate.getFullYear() + 1);
      }
      setData((prev) => ({ ...prev, expiry_date: expiry.toISOString().split("T")[0] }));
    }
  }, [data.package, data.join_date]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let val = value;
    if (name === 'total_amount' || name === 'paid_amount') {
      val = value === '' ? '' : Number(value);
    }
    setData((prev) => ({ ...prev, [name]: val }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(data);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <form className="modal" onSubmit={handleSubmit}>
        <h3>{member ? "Edit Member" : "Add Member"}</h3>

        <div className="form-grid">
          <div className="form-group span-2">
            <label htmlFor="member_id">Member ID</label>
            <input
              id="member_id"
              name="member_id"
              value={data.member_id}
              onChange={handleChange}
              placeholder="Auto-generated ID"
              type="text"
              readOnly
            />
          </div>

          <div className="form-group span-2">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              name="name"
              value={data.name}
              onChange={handleChange}
              placeholder="Full name of the member"
              type="text"
              required
            />
          </div>

          <div className="form-group span-2">
            <label htmlFor="whatsapp">WhatsApp Number</label>
            <input
              id="whatsapp"
              name="whatsapp"
              value={data.whatsapp}
              onChange={handleChange}
              placeholder="10-digit WhatsApp/mobile number"
              pattern="^\d{10}$"
              title="Enter a valid 10-digit number"
              type="text"
              required
            />
          </div>

          <div className="form-group span-2">
            <label htmlFor="package">Membership Package</label>
            <select
              id="package"
              name="package"
              value={data.package}
              onChange={handleChange}
              required
              className="package-select"
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
            <label htmlFor="join_date">Join Date</label>
            <input
              id="join_date"
              name="join_date"
              value={data.join_date}
              onChange={handleChange}
              type="date"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="expiry_date">Expiry Date</label>
            <input
              id="expiry_date"
              name="expiry_date"
              value={data.expiry_date}
              onChange={handleChange}
              type="date"
              required
              readOnly={data.package !== 'custom' && data.package !== ''}
            />
          </div>

          <div className="form-group span-2">
            <label htmlFor="address">Address</label>
            <input
              id="address"
              name="address"
              value={data.address || ''}
              onChange={handleChange}
              placeholder="Address"
              type="text"
            />
          </div>

          <div className="form-group span-2">
            <label htmlFor="health_issues">Health Issues</label>
            <input
              id="health_issues"
              name="health_issues"
              value={data.health_issues || ''}
              onChange={handleChange}
              placeholder="Health issues (if any)"
              type="text"
            />
          </div>

          <div className="form-group span-2">
            <label htmlFor="blood_group">Blood Group</label>
            <input
              id="blood_group"
              name="blood_group"
              value={data.blood_group || ''}
              onChange={handleChange}
              placeholder="e.g., A+, O-"
              type="text"
            />
          </div>

          <div className="form-group span-2">
            <label htmlFor="extra_details">Extra Details</label>
            <input
              id="extra_details"
              name="extra_details"
              value={data.extra_details || ''}
              onChange={handleChange}
              placeholder="Extra details"
              type="text"
            />
          </div>
        </div>

        <div className="payment-details-group">
          <div className="payment-details-title">Payment Details</div>
          <div className="payment-details-grid">
            <div className="form-group">
              <label htmlFor="total_amount">Total Amount</label>
              <input
                id="total_amount"
                name="total_amount"
                value={data.total_amount}
                onChange={handleChange}
                placeholder="Total amount"
                type="number"
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="paid_amount">Amount Paid</label>
              <input
                id="paid_amount"
                name="paid_amount"
                value={data.paid_amount}
                onChange={handleChange}
                placeholder="Amount paid"
                type="number"
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="pending_amount">Amount Due</label>
              <input
                id="pending_amount"
                name="pending_amount"
                value={(data.total_amount - data.paid_amount) > 0 ? (data.total_amount - data.paid_amount) : 'None'}
                type="text"
                readOnly
              />
            </div>
          </div>
        </div>

        <div className="modal-buttons">
          <button type="submit">💾 Save</button>
          <button type="button" onClick={onClose}>
            ❌ Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default MemberForm;
