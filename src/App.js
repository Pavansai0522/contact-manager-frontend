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

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFilterChange = (e) => setFilter({ ...filter, [e.target.name]: e.target.value });
  const resetFilter = () => setFilter({ emailStatus: '', contactStatus: '', search: '', tags: '' });

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

  return (
    <div className="container">
      <aside className="sidebar">
        <h2>Customers</h2>
        <ul>
          <li className="active">Contacts</li>
        </ul>
      </aside>

      <main className="main-content">
        <div className="header">
          <h1>Contacts</h1>
          <div>
            <button onClick={() => setShowModal(true)}>Add Contact</button>
          </div>
        </div>

        <div className="filters">
          <input name="search" placeholder="Search" value={filter.search} onChange={handleFilterChange} />
          <input name="tags" placeholder="Tags" value={filter.tags} onChange={handleFilterChange} />
          <select name="emailStatus" value={filter.emailStatus} onChange={handleFilterChange}>
            <option value="">All Email Status</option>
            <option value="Subscribed">Subscribed</option>
            <option value="Unsubscribed">Unsubscribed</option>
            <option value="Not Specified">Not Specified</option>
          </select>
          <input name="contactStatus" placeholder="Contact Status" value={filter.contactStatus} onChange={handleFilterChange} />
          <button onClick={resetFilter}>Reset</button>
        </div>

        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Email Status</th>
              <th>Phone</th>
              <th>Tags</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => (
              <tr key={c._id}>
                <td>{c.firstName} {c.lastName}</td>
                <td>{c.email}</td>
                <td><span className={`badge ${c.emailStatus.toLowerCase().replace(' ', '-')}`}>{c.emailStatus}</span></td>
                <td>{c.phone}</td>
                <td>{c.tags}</td>
                <td>
                  <button onClick={() => openEditModal(c)}>Edit</button>
                  <button onClick={() => handleDelete(c._id)}>Delete</button>
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

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>{editContact ? 'Edit Contact' : 'Add a Contact'}</h3>
            <form onSubmit={handleSubmit}>
              <input name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" />
              <input name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" />
              <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" />
              <select name="emailStatus" value={formData.emailStatus} onChange={handleChange}>
                <option>Subscribed</option>
                <option>Unsubscribed</option>
                <option>Not Specified</option>
              </select>
              <input name="list" value={formData.list} onChange={handleChange} placeholder="List" />
              <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" />
              <input name="contactStatus" value={formData.contactStatus} onChange={handleChange} placeholder="Status" />
              <input name="tags" value={formData.tags} onChange={handleChange} placeholder="Tags" />
              <button type="submit">{editContact ? 'Update' : 'Add'}</button>
              <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
