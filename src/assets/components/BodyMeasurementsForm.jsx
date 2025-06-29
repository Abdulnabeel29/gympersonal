import React, { useState, useEffect } from "react";

const initialMeasurements = {
  height: '',
  weight: '',
  chest: '',
  waist: '',
  hips: '',
  biceps: '',
  thighs: '',
};

const BodyMeasurementsForm = ({ member, measurements, onSave, onClose }) => {
  const [data, setData] = useState(initialMeasurements);

  useEffect(() => {
    if (measurements) setData(measurements);
    else setData(initialMeasurements);
  }, [measurements]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(data);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <form className="modal" onSubmit={handleSubmit} style={{ minWidth: 320 }}>
        <h3>Body Measurements {member ? `for ${member.name}` : ''}</h3>
        <input name="height" value={data.height} onChange={handleChange} placeholder="Height (cm)" type="number" min="0" />
        <input name="weight" value={data.weight} onChange={handleChange} placeholder="Weight (kg)" type="number" min="0" />
        <input name="chest" value={data.chest} onChange={handleChange} placeholder="Chest (cm)" type="number" min="0" />
        <input name="waist" value={data.waist} onChange={handleChange} placeholder="Waist (cm)" type="number" min="0" />
        <input name="hips" value={data.hips} onChange={handleChange} placeholder="Hips (cm)" type="number" min="0" />
        <input name="biceps" value={data.biceps} onChange={handleChange} placeholder="Biceps (cm)" type="number" min="0" />
        <input name="thighs" value={data.thighs} onChange={handleChange} placeholder="Thighs (cm)" type="number" min="0" />
        <div className="modal-buttons">
          <button type="submit">💾 Save</button>
          <button type="button" onClick={onClose}>❌ Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default BodyMeasurementsForm; 