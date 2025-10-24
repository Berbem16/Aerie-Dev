import React, { useState, useEffect } from 'react';
import { FaUserPlus, FaUserEdit, FaDatabase, FaEye, FaTrash, FaEdit } from 'react-icons/fa';
import './App.css';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [tables, setTables] = useState([]);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    role: 'user',
    password: ''
  });
  const [editingUser, setEditingUser] = useState(null);

  // Get API URL from environment variable or use default
  const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:8000').replace(/\/$/, '');

  // Mock data for demonstration
  useEffect(() => {
    // Mock users data
    setUsers([
      { id: 1, username: 'admin', email: 'admin@uasreporting.com', role: 'admin', created_at: '2024-01-15' },
      { id: 2, username: 'michael', email: 'michael@uasreporting.com', role: 'user', created_at: '2024-01-20' },
      { id: 3, username: 'analyst1', email: 'analyst1@uasreporting.com', role: 'analyst', created_at: '2024-02-01' },
      { id: 4, username: 'reporter1', email: 'reporter1@uasreporting.com', role: 'user', created_at: '2024-02-10' }
    ]);

    // Mock database tables data
    setTables([
      { 
        name: 'uas_sightings', 
        rows: 1247, 
        size: '2.3 MB',
        columns: [
          { name: 'id', type: 'SERIAL PRIMARY KEY', nullable: false },
          { name: 'type_of_sighting', type: 'VARCHAR(255)', nullable: false },
          { name: 'time', type: 'TIMESTAMP WITH TIME ZONE', nullable: false },
          { name: 'latitude', type: 'FLOAT', nullable: false },
          { name: 'longitude', type: 'FLOAT', nullable: false },
          { name: 'location_name', type: 'VARCHAR(255)', nullable: false },
          { name: 'description', type: 'TEXT', nullable: false },
          { name: 'symbol_code', type: 'VARCHAR(50)', nullable: true },
          { name: 'ascc', type: 'VARCHAR(100)', nullable: true },
          { name: 'unit', type: 'VARCHAR(100)', nullable: true },
          { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', nullable: false },
          { name: 'updated_at', type: 'TIMESTAMP WITH TIME ZONE', nullable: true },
          { name: 'image_urls', type: 'JSONB', nullable: false }
        ]
      },
      { 
        name: 'users', 
        rows: 4, 
        size: '0.1 MB',
        columns: [
          { name: 'id', type: 'SERIAL PRIMARY KEY', nullable: false },
          { name: 'username', type: 'VARCHAR(50)', nullable: false },
          { name: 'email', type: 'VARCHAR(100)', nullable: false },
          { name: 'role', type: 'VARCHAR(20)', nullable: false },
          { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', nullable: false }
        ]
      }
    ]);
  }, []);

  const handleAddUser = (e) => {
    e.preventDefault();
    if (newUser.username && newUser.email && newUser.password) {
      const user = {
        id: users.length + 1,
        ...newUser,
        created_at: new Date().toISOString().split('T')[0]
      };
      setUsers([...users, user]);
      setNewUser({ username: '', email: '', role: 'user', password: '' });
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setNewUser({
      username: user.username,
      email: user.email,
      role: user.role,
      password: ''
    });
  };

  const handleUpdateUser = (e) => {
    e.preventDefault();
    if (editingUser && newUser.username && newUser.email) {
      setUsers(users.map(user => 
        user.id === editingUser.id 
          ? { ...user, username: newUser.username, email: newUser.email, role: newUser.role }
          : user
      ));
      setEditingUser(null);
      setNewUser({ username: '', email: '', role: 'user', password: '' });
    }
  };

  const handleDeleteUser = (userId) => {
    setUsers(users.filter(user => user.id !== userId));
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return '#dc3545';
      case 'analyst': return '#ffc107';
      case 'user': return '#28a745';
      default: return '#6c757d';
    }
  };

  return (
    <div className="admin-page">
      <main className="App-main">
        <div className="admin-container">
          <div className="admin-tabs">
            <button 
              className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <FaUserPlus className="tab-icon" />
              User Management
            </button>
            <button 
              className={`admin-tab ${activeTab === 'database' ? 'active' : ''}`}
              onClick={() => setActiveTab('database')}
            >
              <FaDatabase className="tab-icon" />
              Database Manager
            </button>
          </div>

          {activeTab === 'users' && (
            <div className="admin-content">
              <div className="admin-section">
                <h3>Add New User</h3>
                <form onSubmit={editingUser ? handleUpdateUser : handleAddUser} className="admin-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Username:</label>
                      <input
                        type="text"
                        value={newUser.username}
                        onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                        className="form-input"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Email:</label>
                      <input
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                        className="form-input"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Role:</label>
                      <select
                        value={newUser.role}
                        onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                        className="form-input"
                      >
                        <option value="user">User</option>
                        <option value="analyst">Analyst</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Password:</label>
                      <input
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                        className="form-input"
                        required={!editingUser}
                      />
                    </div>
                  </div>
                  <button type="submit" className="submit-btn">
                    {editingUser ? 'Update User' : 'Add User'}
                  </button>
                  {editingUser && (
                    <button 
                      type="button" 
                      className="clear-search-btn"
                      onClick={() => {
                        setEditingUser(null);
                        setNewUser({ username: '', email: '', role: 'user', password: '' });
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </form>
              </div>

              <div className="admin-section">
                <h3>Current Users</h3>
                <div className="users-table">
                  <div className="table-header">
                    <div>Username</div>
                    <div>Email</div>
                    <div>Role</div>
                    <div>Created</div>
                    <div>Actions</div>
                  </div>
                  {users.map(user => (
                    <div key={user.id} className="table-row">
                      <div>{user.username}</div>
                      <div>{user.email}</div>
                      <div>
                        <span 
                          className="role-badge" 
                          style={{ backgroundColor: getRoleColor(user.role) }}
                        >
                          {user.role.toUpperCase()}
                        </span>
                      </div>
                      <div>{user.created_at}</div>
                      <div className="action-buttons">
                        <button 
                          className="action-btn edit"
                          onClick={() => handleEditUser(user)}
                        >
                          <FaEdit />
                        </button>
                        <button 
                          className="action-btn delete"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="admin-content">
              <div className="admin-section">
                <h3>Database Tables</h3>
                <div className="tables-list">
                  {tables.map(table => (
                    <div key={table.name} className="table-card">
                      <div className="table-header">
                        <h4>{table.name}</h4>
                        <div className="table-stats">
                          <span>{table.rows} rows</span>
                          <span>{table.size}</span>
                        </div>
                      </div>
                      <div className="table-columns">
                        <h5>Columns:</h5>
                        <div className="columns-list">
                          {table.columns.map((column, index) => (
                            <div key={index} className="column-item">
                              <span className="column-name">{column.name}</span>
                              <span className="column-type">{column.type}</span>
                              <span className={`column-nullable ${column.nullable ? 'nullable' : 'not-null'}`}>
                                {column.nullable ? 'NULL' : 'NOT NULL'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Admin;
