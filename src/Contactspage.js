// client/src/ContactsPage.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [stats, setStats] = useState({ total: 0, subscribed: 0, unsubscribed: 0 });

  useEffect(() => {
    axios.get('http://localhost:5000/contacts')
      .then(res => {
        setContacts(res.data);

        const subscribed = res.data.filter(c => c.emailStatus === 'Subscribed').length;
        const unsubscribed = res.data.filter(c => c.emailStatus === 'Unsubscribed').length;

        setStats({
          total: res.data.length,
          subscribed,
          unsubscribed
        });
      });
  }, []);

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
            <button>Add Contact</button>
            <button>Import Contacts</button>
          </div>
        </div>

        <div className="stats">
          <div>Total: {stats.total}</div>
          <div>Subscribed: {stats.subscribed}</div>
          <div>Not Subscribed: {stats.unsubscribed}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Email Status</th>
              <th>Contact Status</th>
              <th>Modified</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map(c => (
              <tr key={c._id}>
                <td>{c.email}</td>
                <td>{c.name}</td>
                <td>
                  <span className={`badge ${c.emailStatus.toLowerCase()}`}>
                    {c.emailStatus}
                  </span>
                </td>
                <td>{c.contactStatus}</td>
                <td>{new Date(c.updatedAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}
