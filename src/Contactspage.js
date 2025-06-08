// EnhancedContactsPage.js with multiselect, export, and batch delete
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
  const [selectedContacts, setSelectedContacts] = useState([]);

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
      setStats({ total: contacts.length, subscribed, unsubscribed });
      setSelectedContacts([]);
    } catch (err) {
      console.error('Error fetching contacts:', err);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedContacts(contacts.map(c => c._id));
    } else {
      setSelectedContacts([]);
    }
  };

  const handleSelect = (id) => {
    setSelectedContacts(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleExport = () => {
    const selected = contacts.filter(c => selectedContacts.includes(c._id));
    const csv = selected.map(c => `"${c.firstName} ${c.lastName}","${c.email}","${c.phone}"`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'contacts_export.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteSelected = async () => {
    try {
      await Promise.all(selectedContacts.map(id => axios.delete(`${API_URL}/contacts/${id}`)));
      fetchContacts();
    } catch (err) {
      console.error('Batch delete error:', err);
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

        <div className="stats">
          <div className="stat-card">Total: {stats.total}</div>
          <div className="stat-card">Subscribed: {stats.subscribed}</div>
          <div className="stat-card">Unsubscribed: {stats.unsubscribed}</div>
        </div>

        <div className="filter-row">
          <input
            type="text"
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-outline" onClick={handleExport} disabled={!selectedContacts.length}>Export ({selectedContacts.length})</button>
            <button className="btn-outline" onClick={handleDeleteSelected} disabled={!selectedContacts.length}>Delete Selected</button>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th><input type="checkbox" checked={selectedContacts.length === contacts.length} onChange={handleSelectAll} /></th>
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
                <td>{new Date(c.updatedAt).toLocaleDateString()}</td>
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
    </div>
  );
}
