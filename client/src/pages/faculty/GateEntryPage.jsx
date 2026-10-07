import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import SelectInput from '../../components/SelectInput';

const departmentOptions = ['ECE', 'CSE', 'EEE', 'MECH'].map((value) => ({ value, label: value }));
const yearOptions = ['II', 'III', 'IV'].map((value) => ({ value, label: value }));
const sectionOptions = ['A', 'B'].map((value) => ({ value, label: value }));

const GateEntryPage = () => {
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [section, setSection] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const canLoad = useMemo(() => department && year && section, [department, year, section]);

  const isInvalidScore = (value, maxValue) => {
    if (value === '' || value === null || value === undefined) return false;
    const numericValue = Number(value);
    return Number.isNaN(numericValue) || numericValue < 0 || numericValue > maxValue;
  };

  useEffect(() => {
    if (!canLoad) {
      setStudents([]);
      return;
    }

    const fetchStudents = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/faculty/gate', {
          params: { department, year, section },
        });
        setStudents(data.map((student) => ({
          ...student,
          gateScore: student.gateScore || { test1: 0, test2: 0, test3: 0, test4: 0 },
        })));
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load students');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [canLoad, department, year, section]);

  const handleInputChange = (studentId, field, value) => {
    const numericValue = value === '' ? 0 : Number(value);
    const sanitized = Number.isNaN(numericValue) ? 0 : numericValue;

    setStudents((prev) => prev.map((item) => {
      if (item._id !== studentId) return item;

      const current = item.gateScore || { test1: 0, test2: 0, test3: 0, test4: 0 };
      const next = { ...current, [field]: sanitized };
      return { ...item, gateScore: next };
    }));
  };

  const saveMarks = async () => {
    const records = students.map((student) => {
      const score = student.gateScore || {};
      return {
        studentId: student._id,
        test1: Number(score.test1 || 0),
        test2: Number(score.test2 || 0),
        test3: Number(score.test3 || 0),
        test4: Number(score.test4 || 0),
      };
    });

    setSaving(true);
    try {
      await api.post('/faculty/gate/bulk', { records });
      toast.success('Saved successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save marks');
    } finally {
      setSaving(false);
    }
  };

  const renderStudentRows = () => {
    if (!canLoad) {
      return <div className="empty-state">Select department, year and section to view students.</div>;
    }

    if (loading) return <LoadingSpinner />;

    if (!students.length) {
      return <div className="empty-state">No students found for the selected department, year and section.</div>;
    }

    return (
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Register No</th>
              <th>Student Name</th>
              <th>Test 1 (60)</th>
              <th>Test 2 (40)</th>
              <th>Test 3 (60)</th>
              <th>Test 4 (40)</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => {
              const score = student.gateScore || { test1: 0, test2: 0, test3: 0, test4: 0 };
              const total = Number(score.test1 || 0) + Number(score.test2 || 0) + Number(score.test3 || 0) + Number(score.test4 || 0);

              const scoreFields = [
                { key: 'test1', max: 60 },
                { key: 'test2', max: 40 },
                { key: 'test3', max: 60 },
                { key: 'test4', max: 40 },
              ];

              return (
                <tr key={student._id}>
                  <td>{index + 1}</td>
                  <td>{student.registerNumber}</td>
                  <td>{student.name}</td>
                  {scoreFields.map(({ key, max }) => (
                    <td key={`${student._id}-${key}`}>
                      <input
                        className={`score-input ${isInvalidScore(score[key], max) ? 'invalid' : ''}`}
                        type="number"
                        min="0"
                        max={max}
                        value={score[key] ?? 0}
                        onChange={(event) => handleInputChange(student._id, key, event.target.value)}
                      />
                    </td>
                  ))}
                  <td><span className="total-pill">{total}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <h3>GATE Score Entry</h3>
      </div>

      <div className="form-grid" style={{ marginBottom: '20px' }}>
        <SelectInput label="Department" name="department" value={department} onChange={(event) => setDepartment(event.target.value)} options={departmentOptions} placeholder="Select Department" />
        <SelectInput label="Year" name="year" value={year} onChange={(event) => setYear(event.target.value)} options={yearOptions} placeholder="Select Year" />
        <SelectInput label="Section" name="section" value={section} onChange={(event) => setSection(event.target.value)} options={sectionOptions} placeholder="Select Section" />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '18px' }}>
        <button className="btn btn-primary" onClick={saveMarks} disabled={saving || !students.length}>
          {saving ? 'Saving...' : 'Save Marks'}
        </button>
      </div>

      {renderStudentRows()}
    </div>
  );
};

export default GateEntryPage;
