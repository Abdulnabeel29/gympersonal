import React, { useState } from "react";
import axios from "axios";
import "./MemberTable.css";
import {
  FaEdit,
  FaTrash,
  FaUser,
  FaWhatsapp,
  FaCommentAlt,
  FaRulerHorizontal,
} from "react-icons/fa";

const MemberTable = ({ members, onEdit, onDelete, onOpenBodyMeasurements }) => {
  const [expandedId, setExpandedId] = useState(null);
  const [selected, setSelected] = useState([]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleSelect = (e, id) => {
    e.stopPropagation();
    if (selected.includes(id)) {
      setSelected(selected.filter((s) => s !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected(members.map((m) => m.id));
    } else {
      setSelected([]);
    }
  };

  const handleSendSMS = async (member) => {
    if (!member.whatsapp) {
      alert(`⚠️ ${member.name} has no WhatsApp number.`);
      return;
    }

    try {
      await axios.post(
        "https://solsparrow-backend.onrender.com/api/sms/send",
        {
          name: member.name,
          number: member.whatsapp,
          message: `Hi ${member.name}, your membership expires on ${member.expiry_date}. Please renew soon.`,
        }
      );
      alert(`✅ SMS sent to ${member.name}`);
    } catch (error) {
      console.error("SMS Error:", error);
      alert(`❌ Failed to send SMS to ${member.name}`);
    }
  };

  const handleSendBulkSMS = async () => {
    try {
      const res = await axios.get(
        `https://solsparrow-backend.onrender.com/api/members/send-remainder/${selected.join(",")}`
      );
      alert(res.data.message || "✅ Expiry reminders sent.");
    } catch (error) {
      console.error("Bulk SMS error:", error);
      alert("❌ Failed to send bulk SMS.");
    }
  };

  const handleBulkDelete = async () => {
    if (selected.length === 0) return;

    const confirm = window.confirm(
      `Are you sure you want to delete ${selected.length} member(s)?`
    );
    if (!confirm) return;

    try {
      await axios.post(
        "https://solsparrow-backend.onrender.com/api/members/delete-multiple",
        {
          ids: selected,
        }
      );
      alert("🗑️ Selected members deleted.");
      onDelete(selected);
      setSelected([]);
    } catch (error) {
      console.error("Delete error:", error);
      alert("❌ Failed to delete selected members.");
    }
  };

  const today = new Date();

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toLocaleString()}`;
  };

  const handleActionClick = (e, action) => {
    e.stopPropagation();
    action();
  };

  return (
    <div className="member-table-wrapper">
      <div className="table-header">
        <div className="bulk-actions">
          <label className="select-all-label">
            <input
              type="checkbox"
              onChange={handleSelectAll}
              checked={selected.length === members.length && members.length > 0}
            />
            <span>Select All</span>
          </label>
          {selected.length > 0 && (
            <>
              <button className="bulk-sms-btn" onClick={handleSendBulkSMS}>
                <FaCommentAlt />
                <span>Send SMS ({selected.length})</span>
              </button>
              <button className="bulk-delete-btn" onClick={handleBulkDelete}>
                <FaTrash />
                <span>Delete ({selected.length})</span>
              </button>
            </>
          )}
        </div>
        <div className="table-info">
          <span>{members.length} members</span>
        </div>
      </div>

      <div className="table-container">
        <table className="member-table">
          <thead>
            <tr>
              <th className="checkbox-header"></th>
              <th>Member ID</th>
              <th>Name</th>
              <th>WhatsApp</th>
              <th>Package</th>
              <th>Join Date</th>
              <th>Expiry Date</th>
              <th>Total</th>
              <th>Paid</th>
              <th>Due</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => {
              const isSelected = selected.includes(member.id);
              const isExpired =
                member.expiry_date && new Date(member.expiry_date) < today;

              return (
                <React.Fragment key={member.id}>
                  <tr
                    className={`member-row ${isSelected ? "selected" : ""} ${
                      isExpired ? "expired" : ""
                    }`}
                    onClick={() => toggleExpand(member.id)}
                  >
                    <td
                      className="checkbox-cell"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleSelect(e, member.id)}
                      />
                    </td>
                    <td>{member.member_id}</td>
                    <td className="member-name-cell">{member.name}</td>
                    <td>
                      <a
                        href={`https://wa.me/${member.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="whatsapp-link"
                      >
                        <FaWhatsapp />
                        {member.whatsapp || "N/A"}
                      </a>
                    </td>
                    <td>{member.package}</td>
                    <td>{formatDate(member.join_date)}</td>
                    <td>{formatDate(member.expiry_date)}</td>
                    <td className="total-amount-cell">
                      {formatCurrency(member.total_amount)}
                    </td>
                    <td className="paid-amount-cell">
                      {formatCurrency(member.paid_amount)}
                    </td>
                    <td className="due-amount-cell">
                      {formatCurrency(
                        member.total_amount - member.paid_amount
                      )}
                    </td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <button
                          onClick={(e) =>
                            handleActionClick(e, () => handleSendSMS(member))
                          }
                          className="action-btn action-btn-sms"
                          title="Send SMS"
                        >
                          <FaCommentAlt className="action-icon" />
                        </button>
                        <button
                          onClick={(e) =>
                            handleActionClick(e, () =>
                              onOpenBodyMeasurements(member)
                            )
                          }
                          className="action-btn action-btn-measure"
                          title="Body Measurements"
                        >
                          <FaRulerHorizontal className="action-icon" />
                        </button>
                        <button
                          onClick={(e) =>
                            handleActionClick(e, () => onEdit(member))
                          }
                          className="action-btn action-btn-edit"
                          title="Edit Member"
                        >
                          <FaEdit className="action-icon" />
                        </button>
                        <button
                          className="action-btn action-btn-delete"
                          onClick={(e) =>
                            handleActionClick(e, () => onDelete([member.id]))
                          }
                          title="Delete Member"
                        >
                          <FaTrash className="action-icon" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedId === member.id && (
                    <tr className="expanded-row">
                      <td colSpan="11">
                        <div className="member-details-expanded">
                          <div className="details-grid">
                            <div className="detail-section">
                              <p>
                                <strong>Address:</strong>{" "}
                                {member.address || "N/A"}
                              </p>
                              <p>
                                <strong>Email:</strong>{" "}
                                {member.email || "N/A"}
                              </p>
                              <p>
                                <strong>Health Issues:</strong>{" "}
                                {member.health_issues || "N/A"}
                              </p>
                              <p>
                                <strong>Blood Group:</strong>{" "}
                                {member.blood_group || "N/A"}
                              </p>
                            </div>
                            <div className="detail-section">
                              <p>
                                <strong>Height:</strong> {member.height || "-"}{" "}
                                cm
                              </p>
                              <p>
                                <strong>Weight:</strong> {member.weight || "-"}{" "}
                                kg
                              </p>
                              <p>
                                <strong>Chest:</strong> {member.chest || "-"} cm
                              </p>
                              <p>
                                <strong>Waist:</strong> {member.waist || "-"} cm
                              </p>
                            </div>
                            <div className="detail-section">
                              <p>
                                <strong>Hips:</strong> {member.hips || "-"} cm
                              </p>
                              <p>
                                <strong>Biceps:</strong> {member.biceps || "-"}{" "}
                                cm
                              </p>
                              <p>
                                <strong>Thighs:</strong> {member.thighs || "-"}{" "}
                                cm
                              </p>
                              <p>
                                <strong>Extra Details:</strong>{" "}
                                {member.extra_details || "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>

        {members.length === 0 && (
          <div className="empty-state">
            <FaUser />
            <h3>No Members Found</h3>
            <p>Add your first member to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberTable;