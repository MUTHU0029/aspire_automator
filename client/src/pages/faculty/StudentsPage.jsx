import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';

const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [section, setSection] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/faculty/students', { params: { search, department, year, section } });
        setStudents(data);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load students');
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(fetchStudents, 250);
    return () => clearTimeout(timeout);
  }, [search, department, year, section]);

  return (
    <div className="panel">
      <div className="panel-header">
        <h3>Students</h3>
      </div>

      <div className="filter-row" style={{ marginBottom: '18px' }}>
        <div className="form-field" style={{ flex: '1 1 220px' }}>
          <label>Department</label>
          <select value={department} onChange={(event) => setDepartment(event.target.value)}>
            <option value="">All departments</option>
            <option value="CSE">CSE</option>
            <option value="ECE">ECE</option>
            <option value="EEE">EEE</option>
            <option value="MECH">MECH</option>
          </select>
        </div>

        <div className="form-field" style={{ flex: '1 1 160px' }}>
          <label>Year</label>
          <select value={year} onChange={(event) => setYear(event.target.value)}>
            <option value="">All years</option>
            <option value="II">II</option>
            <option value="III">III</option>
            <option value="IV">IV</option>
          </select>
        </div>

        <div className="form-field" style={{ flex: '1 1 160px' }}>
          <label>Section</label>
          <select value={section} onChange={(event) => setSection(event.target.value)}>
            <option value="">All sections</option>
            <option value="A">A</option>
            <option value="B">B</option>
          </select>
        </div>
      </div>

      <div className="form-field" style={{ maxWidth: '420px', marginBottom: '18px' }}>
        <label>Search by student name or register number</label>
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search students" />
      </div>

      {loading ? <LoadingSpinner /> : (
        students.length ? (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Register No</th>
                  <th>Department</th>
                  <th>Year</th>
                  <th>Section</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student._id}>
                    <td>{student.name}</td>
                    <td>{student.registerNumber}</td>
                    <td>{student.department}</td>
                    <td>{student.year}</td>
                    <td>{student.section}</td>
                    <td>{student.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <div className="empty-state">No students found.</div>
      )}
    </div>
  );
};

export default StudentsPage;
