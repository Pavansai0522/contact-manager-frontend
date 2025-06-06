import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'https://contact-manager-backend-ygfd.onrender.com';

export default function App() {
  const [formData, setFormData] = useState(initialForm());
  const [contacts, setContacts] = useState([]);
  const [filter, setFilter] = useState({ emailStatus: '', contactStatus: '', search: '', tags: '' });
  const [editContact, setEditContact] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  function initialForm() {
    return {
      firstName: '',
      lastName: '',
      email: '',
      emailStatus: 'Subscribed',
      list: '',
      phone: '',
      contactStatus: '',
      tags: ''
    };
  }

  useEffect(() => {
    fetchContacts();
  }, [filter, page]);

  const fetchContacts = async () => {
    try {
      const query = new URLSearchParams({ ...filter, page }).toString();
      const res = await axios.get(`${API_URL}/contacts?${query}`);
      setContacts(res.data.contacts);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editContact) {
        await axios.put(`${API_URL}/contacts/${editContact._id}`, formData);
        setEditContact(null);
      } else {
        await axios.post(`${API_URL}/contacts`, formData);
      }
      setFormData(initialForm());
      setShowModal(false);
      fetchContacts();
    } catch (err) {
      console.error('Submit error:', err);
    }
  };

  const openEditModal = (contact) => {
    setEditContact(contact);
    setFormData(contact);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/contacts/${id}`);
      fetchContacts();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const resetFilter = () => {
    setFilter({ emailStatus: '', contactStatus: '', search: '', tags: '' });
  };

  return (
    <div className="app">
      <h2>{editContact ? 'Edit Contact' : 'Add a Contact'}</h2>
      <form onSubmit={handleSubmit}>
        <input name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} />
        <input name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} />
        <input name="email" placeholder="Email Address" required value={formData.email} onChange={handleChange} />
        <select name="emailStatus" value={formData.emailStatus} onChange={handleChange}>
          <option>Subscribed</option>
          <option>Unsubscribed</option>
          <option>Not Specified</option>
        </select>
        <input name="list" placeholder="Add to List(s)" value={formData.list} onChange={handleChange} />
        <input name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} />
        <input name="contactStatus" placeholder="Contact Status" value={formData.contactStatus} onChange={handleChange} />
        <input name="tags" placeholder="Contact Tags (comma-separated)" value={formData.tags} onChange={handleChange} />
        <button type="submit">{editContact ? 'Update Contact' : 'Add Contact'}</button>
      </form>

      <h3>Search & Filter Contacts</h3>
      <input name="search" placeholder="Search by name or email" value={filter.search} onChange={handleFilterChange} />
      <input name="tags" placeholder="Filter by Tags (comma separated)" value={filter.tags} onChange={handleFilterChange} />
      <select name="emailStatus" value={filter.emailStatus} onChange={handleFilterChange}>
        <option value="">All Email Status</option>
        <option value="Subscribed">Subscribed</option>
        <option value="Unsubscribed">Unsubscribed</option>
        <option value="Not Specified">Not Specified</option>
      </select>
      <input name="contactStatus" placeholder="Contact Status" value={filter.contactStatus} onChange={handleFilterChange} />
      <button onClick={resetFilter}>Reset Filters</button>

      <h3>Contact List</h3>
      <ul>
        {contacts.map((c) => (
          <li key={c._id}>
            {c.firstName} {c.lastName} - {c.email}
            <button onClick={() => openEditModal(c)}>Edit</button>
            <button onClick={() => handleDelete(c._id)}>Delete</button>
          </li>
        ))}
      </ul>

      <div className="pagination">
        <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1}>Prev</button>
        <span>Page {page} of {totalPages}</span>
        <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages}>Next</button>
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Edit Contact</h3>
            <form onSubmit={handleSubmit}>
              <input name="firstName" value={formData.firstName} onChange={handleChange} />
              <input name="lastName" value={formData.lastName} onChange={handleChange} />
              <input name="email" value={formData.email} onChange={handleChange} />
              <select name="emailStatus" value={formData.emailStatus} onChange={handleChange}>
                <option>Subscribed</option>
                <option>Unsubscribed</option>
                <option>Not Specified</option>
              </select>
              <input name="list" value={formData.list} onChange={handleChange} />
              <input name="phone" value={formData.phone} onChange={handleChange} />
              <input name="contactStatus" value={formData.contactStatus} onChange={handleChange} />
              <input name="tags" value={formData.tags} onChange={handleChange} />
              <button type="submit">Save</button>
              <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
