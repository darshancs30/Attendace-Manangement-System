import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Employees.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Employees = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    department: '',
    search: '',
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/users/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([]);
    }
    setLoading(false);
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesDepartment = !filter.department || emp.department === filter.department;
    const matchesSearch =
      !filter.search ||
      emp.name.toLowerCase().includes(filter.search.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(filter.search.toLowerCase()) ||
      emp.email.toLowerCase().includes(filter.search.toLowerCase());
    return matchesDepartment && matchesSearch;
  });

  const departments = [...new Set(employees.map((emp) => emp.department))];

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="container">
      <h1>All Employees</h1>

      {/* Filters */}
      <div className="card">
        <div className="filters-grid">
          <div className="form-group">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search by name, ID, or email..."
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Department</label>
            <select
              value={filter.department}
              onChange={(e) => setFilter({ ...filter, department: e.target.value })}
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="card">
        <h3>Employee List ({filteredEmployees.length})</h3>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => (
                  <tr key={employee._id}>
                    <td>{employee.employeeId}</td>
                    <td>{employee.name}</td>
                    <td>{employee.email}</td>
                    <td>
                      <span className="department-badge">{employee.department}</span>
                    </td>
                    <td>
                      <span className={`badge ${employee.role === 'manager' ? 'badge-info' : 'badge-success'}`}>
                        {employee.role}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          navigate(`/manager/attendance?employeeId=${employee.employeeId}`);
                        }}
                      >
                        View Attendance
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center' }}>
                    No employees found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Employees;

