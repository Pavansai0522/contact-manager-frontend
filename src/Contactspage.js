// ContactsPage.js
import React, { useEffect, useState } from 'react';
import './App.css';
import API from './api';

API.get('/contacts').then((res) => {
  console.log(res.data);
});


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

  useEffect(() => {
  const handleClickOutside = (e) => {
    if (!e.target.closest('.row-menu-wrapper')) {
      setActiveMenu(null);
    }
  };
  document.addEventListener('click', handleClickOutside);
  return () => document.removeEventListener('click', handleClickOutside);
}, []);



  const fetchContacts = async () => {
    try {
      const query = new URLSearchParams({ page, limit: LIMIT, search }).toString();
      const res = await API.get(`/contacts?${query}`);
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
        await API.put(`/contacts/${formData._id}`, payload);
      } else {
        await API.post(`/contacts`, payload);
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
  setSelectedContacts((prev) => {
    const updated = prev.includes(id)
      ? prev.filter((x) => x !== id)
      : [...prev, id];
    console.log("Selected contacts:", updated);
    return updated;
  });
};







  const handleEdit = (contact) => {
    setFormData(contact);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/contacts/${id}`);
      setActiveMenu(null);
      fetchContacts();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };
 
 const handleDeleteSelected = async () => {
  console.log("🔥 Deleting selected contacts:", selectedContacts);

  const validIds = selectedContacts.filter(id => id); // remove undefined
  if (validIds.length === 0) {
    console.warn("🚫 No valid IDs selected");
    return;
  }

  try {
    for (const id of validIds) {
      console.log("Deleting ID:", id);
      await API.delete(`/contacts/${id}`);
    }

    setSelectedContacts([]);
    setActiveMenu(null);
    fetchContacts();
  } catch (error) {
    console.error("❌ Bulk delete error:", error);
  }
};





const handleImportContacts = async () => {
  try {
    const res = await API.post("/contacts/import");
   const imported = res.data;

    // Append imported contacts to existing list
    setContacts(prev => [...prev, ...imported]);
  } catch (err) {
    console.error("Import failed:", err);
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
            <button className="btn-outline" onClick={handleImportContacts}>Import Contacts</button>
            <button className="btn-filled" onClick={() => setShowModal(true)}>Add a Contact</button>
          </div>
        </div>
              <div className="stats-cards">
                <div className="tile">
                  <div className="tile-title">Total contacts</div>
                  <div className="tile-value-with-trend">
                    <span className="tile-value">{stats.total}</span>
                    <span className="tile-trend up">
                     <svg
                         className="icon"
                         viewBox="0 0 24 24"
                         xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                       >       
                            <path d="M21,5H17a1,1,0,0,0,0,2h1.59L14,11.59l-2.29-2.3a1,1,0,0,0-1.42,0l-8,8a1,1,0,0,0,0,1.42,1,1,0,0,0,1.42,0L11,11.41l2.29,2.3a1,1,0,0,0,1.42,0L20,8.41V10a1,1,0,0,0,2,0V6A1,1,0,0,0,21,5Z" />
                      </svg>



                      +11 past 30 days
                    </span>
                  </div>
                </div>

                <div className="tile">
                  <div className="tile-title">Subscribed</div>
                  <div className="tile-value-with-trend">
                    <span className="tile-value">{stats.subscribed}</span>
                    <span className="tile-trend up">
                      <svg
                       className="icon"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                         fill="currentColor"
                          >
                          <path d="M21,5H17a1,1,0,0,0,0,2h1.59L14,11.59l-2.29-2.3a1,1,0,0,0-1.42,0l-8,8a1,1,0,0,0,0,1.42,1,1,0,0,0,1.42,0L11,11.41l2.29,2.3a1,1,0,0,0,1.42,0L20,8.41V10a1,1,0,0,0,2,0V6A1,1,0,0,0,21,5Z" />
                      </svg>



                      +6 past 30 days
                    </span>
                  </div>
                </div>

                <div className="tile">
                  <div className="tile-title">Not subscribed</div>
                  <div className="tile-value-with-trend">
                    <span className="tile-value">{stats.unsubscribed}</span>
                    <span className="tile-trend down">
                     <svg
                      className="icon"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                    >
                      <path d="M21 19H17a1 1 0 0 1 0-2h1.59L14 12.41l-2.29 2.3a1 1 0 0 1-1.42 0l-8-8a1 1 0 0 1 1.42-1.42L11 12.59l2.29-2.3a1 1 0 0 1 1.42 0L20 15.59V14a1 1 0 0 1 2 0v4a1 1 0 0 1-1 1Z" />
                     </svg>
                     
                      +5 past 30 days
                    </span>
                  </div>
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

        <div style={{ overflowX: 'auto', position: 'relative', zIndex: 0 }}>
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
                  <tr key={c?._id} style={{ position: 'relative', zIndex: 0 }}>
                    <td>
                       <input
                        type="checkbox"
                        value={c._id}
                        checked={selectedContacts.includes(c._id)}
                          onChange={() => handleSelect(c._id)}
                      />




                    </td>
                    <td>{c.firstName} {c.lastName}</td>
                    <td>{c.email}</td>
                    <td>
                      <span className={`badge ${c.emailStatus.toLowerCase().replace(/ /g, '-')}`}>
                        {c.emailStatus}
                      </span>
                    </td>
                    <td>{c.phone}</td>
                    <td>
                      <span className={`badge ${c.contactStatus?.toLowerCase().replace(/\s+/g, '-')}`}>
                        {c.contactStatus || 'N/A'}
                      </span>
                    </td>
                    <td>
                      {c.updatedAt && !isNaN(Date.parse(c.updatedAt))
                        ? new Date(c.updatedAt).toLocaleDateString()
                        : '—'}
                    </td>
                    <td style={{ position: 'relative' }}>
                      <div className="row-menu-wrapper" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="dots-button"
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setActiveMenu({
                              id: c._id,
                              top: rect.bottom + window.scrollY,
                              left: rect.left + window.scrollX
                            });
                          }}
                        >
                          ⋮
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>

              </table>
            </div>

        

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
