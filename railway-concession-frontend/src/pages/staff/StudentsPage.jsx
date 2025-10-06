import React, { useState, useEffect } from 'react';
import studentService from '../../services/studentService';
import ErrorMessage from '../../components/common/ErrorMessage';
import SuccessMessage from '../../components/common/SuccessMessage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import StudentForm from '../../components/forms/StudentForm';

const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await studentService.getAllStudents();
      setStudents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    if (!searchTerm.trim()) {
      setFilteredStudents(students);
      return;
    }

    const filtered = students.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(filtered);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAddStudent = () => {
    setSelectedStudent(null);
    setIsModalOpen(true);
  };

  const handleEditStudent = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      return;
    }

    try {
      await studentService.deleteStudent(studentId);
      setSuccess('Student deleted successfully!');
      fetchStudents(); // Refresh the list
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStudentSuccess = () => {
    setIsModalOpen(false);
    setSuccess(selectedStudent ? 'Student updated successfully!' : 'Student added successfully!');
    fetchStudents(); // Refresh the list
  };

  const getApplicationCount = (student) => {
    return student.applications ? student.applications.length : 0;
  };

  if (loading) return <LoadingSpinner text="Loading students..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students Management</h1>
          <p className="text-gray-600">Manage student records and applications</p>
        </div>
        <Button onClick={handleAddStudent} className="mt-4 sm:mt-0">
          👥 Add New Student
        </Button>
      </div>

      {success && <SuccessMessage message={success} onDismiss={() => setSuccess('')} />}

      {/* Search and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search students by name, email, or ID..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </Card>

        <Card>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{students.length}</div>
              <div className="text-sm text-gray-600">Total Students</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {students.filter(s => getApplicationCount(s) > 0).length}
              </div>
              <div className="text-sm text-gray-600">Active Applicants</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Students Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applications</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {student.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                      {student.category || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getApplicationCount(student)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditStudent(student)}
                    >
                      ✏️ Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDeleteStudent(student.id)}
                    >
                      🗑️ Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No students found' : 'No students registered'}
            </h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first student'}
            </p>
          </div>
        )}
      </Card>

      {/* Add/Edit Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedStudent ? 'Edit Student' : 'Add New Student'}
        size="lg"
      >
        <StudentForm
          editData={selectedStudent}
          onSuccess={handleStudentSuccess}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default StudentsPage;