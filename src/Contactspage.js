// ContactsPage.js
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
  const [activeMenu, setActiveMenu] = useState(null);

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
      if (formData._id) {
        await axios.put(`${API_URL}/contacts/${formData._id}`, payload);
      } else {
        await axios.post(`${API_URL}/contacts`, payload);
      }
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

  const handleEdit = (contact) => {
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
  const handleDeleteSelected = async () => {
  try {
    await Promise.all(
      selectedContacts.map(id => axios.delete(`${API_URL}/contacts/${id}`))
    );
    setSelectedContacts([]);
    fetchContacts();
  } catch (err) {
    console.error('Bulk delete error:', err);
  }
};


  return (
    <div className="container">
      <aside className="sidebar">
        <h2>Customers</h2>
        <ul><li className="active">Contacts</li></ul>
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

            <div className="filter-row">
              <input
                type="text"
                placeholder="Search contacts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn-outline" onClick={() => setShowFilter(true)}>Filters</button>
                <button className="btn-outline" disabled={!selectedContacts.length}>
                  Export ({selectedContacts.length})
                </button>

                {selectedContacts.length > 0 && (
                  <button className="btn-outline danger" onClick={handleDeleteSelected}>
                    Delete Selected
                  </button>
                )}
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
              <th></th>
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
                <td>
                  <div className="row-menu-wrapper" onClick={e => e.stopPropagation()}>
                    <button className="dots-button" onClick={() => setActiveMenu(activeMenu === c._id ? null : c._id)}>⋮</button>
                    {activeMenu === c._id && (
                      <div className="dropdown-menu">
                        <button onClick={() => handleEdit(c)}>Edit</button>
                        <button onClick={() => handleDelete(c._id)}>Delete</button>
                      </div>
                    )}
                  </div>
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
            <h3>{formData._id ? 'Edit Contact' : 'Add a Contact'}</h3>
            <p className="subtext">{formData._id ? 'Update details' : 'Add individual contact details'}</p>
            <form className="modal-grid" onSubmit={handleSubmit}>
              <input name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" />
              <input name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" />
              <input name="email" value={formData.email} onChange={handleChange} placeholder="Email Address" required />
              <select name="emailStatus" value={formData.emailStatus} onChange={handleChange}>
                <option value="Subscribed">Subscribed</option>
                <option value="Unsubscribed">Unsubscribed</option>
                <option value="Not Specified">Not Specified</option>
              </select>
              <input name="list" value={formData.list} onChange={handleChange} placeholder="Add to List(s)" />
              <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" />
              <select name="contactStatus" value={formData.contactStatus} onChange={handleChange}>
                <option value="">Select Contact Status</option>
                <option value="New Lead">New Lead</option>
                <option value="Engaged Lead">Engaged Lead</option>
                <option value="Stale Lead">Stale Lead</option>
                <option value="New Sale">New Sale</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <input name="tags" value={formData.tags} onChange={handleChange} placeholder="Contact Tags" />
              <div className="modal-buttons">
                <button type="button" className="btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-filled">{formData._id ? 'Save Changes' : 'Add & Close'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
