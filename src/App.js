import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'https://contact-manager-backend-ygfd.onrender.com';
const LIMIT = 15;

export default function App() {
  const [formData, setFormData] = useState(initialForm());
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [filter, setFilter] = useState({ emailStatus: '', contactStatus: '', search: '' });
  const [editContact, setEditContact] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedDomain, setSelectedDomain] = useState('birdsongcafe.com');

  function initialForm() {
    return {
      firstName: '',
      lastName: '',
      email: '',
      emailStatus: 'Subscribed',
      list: '',
      phone: '',
      contactStatus: '',
    };
  }

  useEffect(() => {
    fetchContacts();
  }, [filter, page]);

  const fetchContacts = async () => {
    try {
      const query = new URLSearchParams({ ...filter, page, limit: LIMIT }).toString();
      const res = await axios.get(`${API_URL}/contacts?${query}`);
      setContacts(res.data.contacts);
      setTotalPages(res.data.totalPages);
      setSelectedContacts([]); // Reset selection on new fetch
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFilterChange = (e) => setFilter({ ...filter, [e.target.name]: e.target.value });
  const resetFilter = () => setFilter({ emailStatus: '', contactStatus: '', search: '' });

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

  const handleBatchDelete = async () => {
    try {
      await Promise.all(
        selectedContacts.map((id) => axios.delete(`${API_URL}/contacts/${id}`))
      );
      fetchContacts();
    } catch (err) {
      console.error('Batch delete error:', err);
    }
  };

  const toggleSelectAll = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map((c) => c._id));
    }
  };

  const toggleCheckbox = (id) => {
    if (selectedContacts.includes(id)) {
      setSelectedContacts(selectedContacts.filter((i) => i !== id));
    } else {
      setSelectedContacts([...selectedContacts, id]);
    }
  };

  const showOnlySubscribers = () => {
    setFilter({ emailStatus: 'Subscribed', contactStatus: '', search: '' });
    setPage(1);
  };

  return (
    <div className="container">
      <aside className="sidebar">
        <h2>Customers</h2>
        <ul>
          <li className="active">Contacts</li>
        </ul>
      </aside>

      <main className="main-content">
        <div className="header-top">
          <div>
            <h2>Contacts</h2>
            <div className="domain-label">
              For:{" "}
              <select value={selectedDomain} onChange={(e) => setSelectedDomain(e.target.value)}>
                <option>birdsongcafe.com</option>
                <option>radiantdigital.com</option>
              </select>
            </div>
          </div>
          <div className="header-buttons">
            <button className="btn-outline">Import Contacts</button>
            <button className="btn-filled" onClick={() => setShowModal(true)}>Add a Contact</button>
          </div>
        </div>

        <div className="summary-cards">
          <div className="card">
            <p>Total contacts</p>
            <h3>{contacts.length}</h3>
            <span className="trend up">+11 past 30 days</span>
          </div>
          <div className="card">
            <p>Subscribed</p>
            <h3>{contacts.filter(c => c.emailStatus === 'Subscribed').length}</h3>
            <span className="trend up">+6 past 30 days</span>
          </div>
          <div className="card">
            <p>Not subscribed</p>
            <h3>{contacts.filter(c => c.emailStatus === 'Unsubscribed').length}</h3>
            <span className="trend down">-5 past 30 days</span>
          </div>
        </div>

        <div className="topbar">
          <input
            type="text"
            className="search-input"
            name="search"
            placeholder="🔍 Search by email or name"
            value={filter.search}
            onChange={handleFilterChange}
          />
          <div className="topbar-buttons">
            <button className="btn-outline" onClick={() => setShowFilters(true)}>Filters</button>
            <button className="btn-outline" onClick={showOnlySubscribers}>Show Subscribers</button>
            <button className="btn-outline" onClick={handleBatchDelete} disabled={selectedContacts.length === 0}>
              Delete Selected
            </button>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th><input type="checkbox" onChange={toggleSelectAll} checked={selectedContacts.length === contacts.length} /></th>
              <th>Name</th>
              <th>Email</th>
              <th>Email Status</th>
              <th>Phone</th>
              <th>Contact Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => (
              <tr key={c._id}>
                <td><input type="checkbox" checked={selectedContacts.includes(c._id)} onChange={() => toggleCheckbox(c._id)} /></td>
                <td>{c.firstName} {c.lastName}</td>
                <td>{c.email}</td>
                <td><span className={`badge ${c.emailStatus.toLowerCase().replace(' ', '-')}`}>{c.emailStatus}</span></td>
                <td>{c.phone}</td>
                <td>
                  <span className={`badge ${c.contactStatus ? c.contactStatus.toLowerCase().replace(/\s+/g, '-') : 'n-a'}`}>
                    {c.contactStatus || 'N/A'}
                  </span>
                </td>
                <td>
                  <button className="btn-outline" onClick={() => openEditModal(c)}>Edit</button>
                  <button className="btn-outline" onClick={() => handleDelete(c._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
          <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1}>Prev</button>
          <span>Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages}>Next</button>
        </div>
      </main>

      {/* Modals and Filter UI remain unchanged from your version */}
    </div>
  );
}
