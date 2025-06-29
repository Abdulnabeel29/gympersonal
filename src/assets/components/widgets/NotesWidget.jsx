import React, { useState, useEffect } from 'react';
import api from '../../../service/api';
import './NotesWidget.css';
import { FaEdit, FaSave, FaTimes } from 'react-icons/fa';

const NotesWidget = () => {
  const [note, setNote] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchNote();
  }, []);

  const fetchNote = async () => {
    try {
      const response = await api.get('/insights/notes');
      setNote(response.data.note || '');
    } catch (error) {
      console.error('Failed to fetch note:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/insights/notes', { note });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    fetchNote(); // Reset to original note
    setIsEditing(false);
  };

  if (loading) {
    return <div className="widget-loading">Loading notes...</div>;
  }

  return (
    <div className="notes-widget-container">
      <div className="notes-header">
        <h3>Quick Notes</h3>
        {!isEditing ? (
          <button 
            className="edit-btn" 
            onClick={() => setIsEditing(true)}
            title="Edit note"
          >
            <FaEdit />
          </button>
        ) : (
          <div className="edit-actions">
            <button 
              className="save-btn" 
              onClick={handleSave}
              disabled={saving}
              title="Save note"
            >
              <FaSave />
            </button>
            <button 
              className="cancel-btn" 
              onClick={handleCancel}
              title="Cancel editing"
            >
              <FaTimes />
            </button>
          </div>
        )}
      </div>
      
      <div className="notes-content">
        {isEditing ? (
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Write your notes here..."
            className="notes-textarea"
            autoFocus
          />
        ) : (
          <div className="notes-display">
            {note ? (
              <p>{note}</p>
            ) : (
              <p className="empty-note">No notes yet. Click edit to add some!</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesWidget; 