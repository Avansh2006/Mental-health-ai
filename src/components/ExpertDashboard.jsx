import React, { useState } from 'react';

const ExpertDashboard = () => {
    // Mock data for inquiries - in a real app, this would come from a backend
    const [inquiries, setInquiries] = useState([
        {
            id: 1,
            name: "John Doe",
            email: "john@example.com",
            phone: "+1234567890",
            date: "2025-08-01",
            time: "10:00",
            concerns: "Experiencing anxiety and stress at work",
            status: "pending"
        },
        {
            id: 2,
            name: "Jane Smith",
            email: "jane@example.com",
            phone: "+1987654321",
            date: "2025-08-02",
            time: "14:30",
            concerns: "Having trouble with sleep patterns",
            status: "confirmed"
        }
    ]);

    const handleStatusChange = (id, newStatus) => {
        setInquiries(inquiries.map(inquiry => 
            inquiry.id === id ? { ...inquiry, status: newStatus } : inquiry
        ));
    };

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'confirmed':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-teal-600">Expert Dashboard</h1>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                <span className="text-sm text-gray-600">Pending: {inquiries.filter(i => i.status === 'pending').length}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                <span className="text-sm text-gray-600">Confirmed: {inquiries.filter(i => i.status === 'confirmed').length}</span>
                            </div>
                        </div>
                    </div>

                    {/* Inquiries Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Details</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Appointment</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Concerns</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {inquiries.map((inquiry) => (
                                    <tr key={inquiry.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{inquiry.name}</div>
                                            <div className="text-sm text-gray-500">{inquiry.email}</div>
                                            <div className="text-sm text-gray-500">{inquiry.phone}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{new Date(inquiry.date).toLocaleDateString()}</div>
                                            <div className="text-sm text-gray-500">{inquiry.time}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 max-w-xs">{inquiry.concerns}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(inquiry.status)}`}>
                                                {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                {inquiry.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleStatusChange(inquiry.id, 'confirmed')}
                                                            className="px-3 py-1 text-xs text-white bg-teal-600 rounded hover:bg-teal-700"
                                                        >
                                                            Confirm
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusChange(inquiry.id, 'cancelled')}
                                                            className="px-3 py-1 text-xs text-white bg-red-600 rounded hover:bg-red-700"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </>
                                                )}
                                                {inquiry.status === 'confirmed' && (
                                                    <button
                                                        onClick={() => {
                                                            // Here you would typically start a video call
                                                            alert('Starting video call with ' + inquiry.name);
                                                        }}
                                                        className="px-3 py-1 text-xs text-white bg-blue-600 rounded hover:bg-blue-700"
                                                    >
                                                        Start Call
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExpertDashboard;
