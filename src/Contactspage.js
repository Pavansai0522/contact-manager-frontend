// EnhancedContactsPage.js with top-right dropdown for selected contacts
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'https://contact-manager-backend-ygfd.onrender.com';
const LIMIT = 15;

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ total: 0, subscribed: 0, unsubscribed: 0 });
  const [search, setSearch] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('birdsongcafe.com');
  const [showModal, setShowModal] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [filters, setFilters] = useState({ subscribed: true, unsubscribed: true, notSpecified: true });
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', emailStatus: 'Subscribed', list: '',
    phone: '', contactStatus: '', tags: ''
  });
  const [showActionMenu, setShowActionMenu] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, [page, search]);

  const fetchContacts = async () => {
    try {
      const query = new URLSearchParams({ page, limit: LIMIT, search }).toString();
      const res = await axios.get(`${API_URL}/contacts?${query}`);
      const contacts = res.data.contacts;

      const subscribed = contacts.filter(c => c.emailStatus === 'Subscribed').length;
      const unsubscribed = contacts.filter(c => c.emailStatus === 'Unsubscribed').length;

      setContacts(contacts);
      setTotalPages(res.data.totalPages);
      setStats({
        total: res.data.totalContacts,
        subscribed,
        unsubscribed
      });
      setSelectedContacts([]);
    } catch (err) {
      console.error('Error fetching contacts:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
      };
      await axios.post(`${API_URL}/contacts`, payload);
      setFormData({
        firstName: '', lastName: '', email: '', emailStatus: 'Subscribed',
        list: '', phone: '', contactStatus: '', tags: ''
      });
      setShowModal(false);
      fetchContacts();
    } catch (err) {
      console.error('Submit error:', err);
    }
  };

  const toggleFilter = (key) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelect = (id) => {
    setSelectedContacts(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = async () => {
    try {
      await Promise.all(selectedContacts.map(id => axios.delete(`${API_URL}/contacts/${id}`)));
      fetchContacts();
    } catch (err) {
      console.error('Batch delete error:', err);
    }
  };

  const handleEditSelected = () => {
    alert('Edit selected: ' + selectedContacts.join(', '));
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
              For:{' '}
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

        <div className="table-actions">
          {selectedContacts.length > 0 && (
            <div className="dropdown-wrapper">
              <button onClick={() => setShowActionMenu(!showActionMenu)}>⋮</button>
              {showActionMenu && (
                <div className="dropdown-menu">
                  <button onClick={handleEditSelected}>Edit</button>
                  <button onClick={handleDeleteSelected}>Delete</button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="filter-row">
          <input
            type="text"
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-outline" onClick={() => setShowFilter(true)}>Filters</button>
            <button className="btn-outline" disabled={!selectedContacts.length}>Export ({selectedContacts.length})</button>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>Email</th>
              <th>Email Status</th>
              <th>Phone</th>
              <th>Contact Status</th>
              <th>Modified</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => (
              <tr key={c._id}>
                <td><input type="checkbox" checked={selectedContacts.includes(c._id)} onChange={() => handleSelect(c._id)} /></td>
                <td>{c.firstName} {c.lastName}</td>
                <td>{c.email}</td>
                <td><span className={`badge ${c.emailStatus.toLowerCase().replace(/ /g, '-')}`}>{c.emailStatus}</span></td>
                <td>{c.phone}</td>
                <td><span className={`badge ${c.contactStatus?.toLowerCase().replace(/\s+/g, '-')}`}>{c.contactStatus || 'N/A'}</span></td>
                <td>{c.updatedAt && !isNaN(Date.parse(c.updatedAt)) ? new Date(c.updatedAt).toLocaleDateString() : '—'}</td>
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

      {/* Modal and filter dialogs stay unchanged */}
    </div>
  );
}
