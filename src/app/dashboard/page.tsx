'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Calendar,
  DollarSign,
  Users,
  Eye,
  Edit,
  Trash2,
  Play,
  Pause,
  CheckCircle,
  Phone,
  XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Campaign {
  _id: string;
  name: string;
  customerCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Customer {
  _id: string;
  phone: string;
  isVerified: boolean;
  createdAt: string;
  verifiedAt?: string;
}

export default function Dashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [formData, setFormData] = useState({
    name: '',
  });
  const [customerForm, setCustomerForm] = useState({
    phone: '',
    otp: '',
  });
  const [showOtpInput, setShowOtpInput] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/campaigns');
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data);
      } else {
        toast.error('Failed to fetch campaigns');
      }
    } catch (error) {
      toast.error('Error fetching campaigns');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/customers`);
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      } else {
        toast.error('Failed to fetch customers');
      }
    } catch (error) {
      toast.error('Error fetching customers');
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newCampaign = await response.json();
        setCampaigns([newCampaign, ...campaigns]);
        setShowCreateModal(false);
        setFormData({ name: '' });
        toast.success('Campaign created successfully!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create campaign');
      }
    } catch (error) {
      toast.error('Error creating campaign');
    }
  };

  const handleRegisterCustomer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCampaign) return;

    try {
      const response = await fetch(
        `/api/campaigns/${selectedCampaign._id}/customers`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ phone: customerForm.phone }),
        }
      );

      if (response.ok) {
        setShowOtpInput(true);
        toast.success('Customer registered! Check console for OTP.');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to register customer');
      }
    } catch (error) {
      toast.error('Error registering customer');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCampaign) return;

    try {
      const response = await fetch(
        `/api/campaigns/${selectedCampaign._id}/customers/verify`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone: customerForm.phone,
            otp: customerForm.otp,
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        toast.success('Customer verified successfully!');
        setShowCustomerModal(false);
        setShowOtpInput(false);
        setCustomerForm({ phone: '', otp: '' });
        setSelectedCampaign(null);

        // Refresh campaigns to update customer count
        fetchCampaigns();

        // Refresh customers list
        if (selectedCampaign) {
          fetchCustomers(selectedCampaign._id);
        }
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to verify OTP');
      }
    } catch (error) {
      toast.error('Error verifying OTP');
    }
  };

  const openCustomerModal = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setShowCustomerModal(true);
    setShowOtpInput(false);
    setCustomerForm({ phone: '', otp: '' });
    fetchCustomers(campaign._id);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex justify-between items-center'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>
                Campaign Dashboard
              </h1>
              <p className='mt-2 text-gray-600'>
                Manage your campaigns and customer registrations
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors'
            >
              <Plus className='w-5 h-5' />
              Create Campaign
            </button>
          </div>
        </div>

        {/* Campaigns List */}
        <div className='bg-white rounded-lg shadow-sm'>
          <div className='px-6 py-4 border-b border-gray-200'>
            <h2 className='text-lg font-semibold text-gray-900'>Campaigns</h2>
          </div>

          {campaigns.length === 0 ? (
            <div className='p-12 text-center'>
              <div className='mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4'>
                <Users className='w-12 h-12 text-gray-400' />
              </div>
              <h3 className='text-lg font-medium text-gray-900 mb-2'>
                No campaigns yet
              </h3>
              <p className='text-gray-600 mb-6'>
                Get started by creating your first campaign
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto transition-colors'
              >
                <Plus className='w-5 h-5' />
                Create Campaign
              </button>
            </div>
          ) : (
            <div className='p-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {campaigns.map((campaign) => (
                  <div
                    key={campaign._id}
                    className='bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow'
                  >
                    <div className='flex justify-between items-start mb-4'>
                      <div className='flex-1'>
                        <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                          {campaign.name}
                        </h3>
                        <p className='text-sm text-gray-500'>
                          Created {formatDate(campaign.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className='flex items-center justify-between mb-4'>
                      <div className='flex items-center'>
                        <Users className='w-5 h-5 text-blue-600 mr-2' />
                        <span className='text-sm font-medium text-gray-700'>
                          {campaign.customerCount} customer
                          {campaign.customerCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    <div className='flex space-x-2'>
                      <Link
                        href={`/campaign/${campaign._id}`}
                        className='flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-1'
                      >
                        <Users className='w-4 h-4' />
                        View Customers
                      </Link>
                      <button
                        className='bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-3 rounded-md text-sm font-medium transition-colors'
                        title='Edit'
                      >
                        <Edit className='w-4 h-4' />
                      </button>
                      <button
                        className='bg-red-100 hover:bg-red-200 text-red-700 py-2 px-3 rounded-md text-sm font-medium transition-colors'
                        title='Delete'
                      >
                        <Trash2 className='w-4 h-4' />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50'>
          <div className='relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white'>
            <div className='mt-3'>
              <div className='flex justify-between items-center mb-4'>
                <h3 className='text-lg font-medium text-gray-900'>
                  Create New Campaign
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className='text-gray-400 hover:text-gray-600'
                >
                  <svg
                    className='w-6 h-6'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M6 18L18 6M6 6l12 12'
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateCampaign} className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Campaign Name
                  </label>
                  <input
                    type='text'
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='Enter campaign name'
                  />
                </div>

                <div className='flex justify-end space-x-3 pt-4'>
                  <button
                    type='button'
                    onClick={() => setShowCreateModal(false)}
                    className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    className='px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors'
                  >
                    Create Campaign
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Customer Management Modal */}
      {showCustomerModal && selectedCampaign && (
        <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50'>
          <div className='relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white'>
            <div className='mt-3'>
              <div className='flex justify-between items-center mb-4'>
                <h3 className='text-lg font-medium text-gray-900'>
                  Manage Customers - {selectedCampaign.name}
                </h3>
                <button
                  onClick={() => setShowCustomerModal(false)}
                  className='text-gray-400 hover:text-gray-600'
                >
                  <svg
                    className='w-6 h-6'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M6 18L18 6M6 6l12 12'
                    />
                  </svg>
                </button>
              </div>

              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                {/* Register Customer Form */}
                <div className='bg-gray-50 p-4 rounded-lg'>
                  <h4 className='text-md font-medium text-gray-900 mb-4'>
                    Register New Customer
                  </h4>

                  {!showOtpInput ? (
                    <form
                      onSubmit={handleRegisterCustomer}
                      className='space-y-4'
                    >
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          Phone Number
                        </label>
                        <input
                          type='tel'
                          required
                          value={customerForm.phone}
                          onChange={(e) =>
                            setCustomerForm({
                              ...customerForm,
                              phone: e.target.value,
                            })
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                          placeholder='+1234567890'
                        />
                      </div>
                      <button
                        type='submit'
                        className='w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors'
                      >
                        Register Customer
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOtp} className='space-y-4'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          Enter OTP
                        </label>
                        <input
                          type='text'
                          required
                          maxLength={6}
                          value={customerForm.otp}
                          onChange={(e) =>
                            setCustomerForm({
                              ...customerForm,
                              otp: e.target.value,
                            })
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg'
                          placeholder='123456'
                        />
                        <p className='text-sm text-gray-500 mt-1'>
                          OTP sent to {customerForm.phone}
                        </p>
                      </div>
                      <div className='flex space-x-2'>
                        <button
                          type='button'
                          onClick={() => setShowOtpInput(false)}
                          className='flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md transition-colors'
                        >
                          Back
                        </button>
                        <button
                          type='submit'
                          className='flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition-colors'
                        >
                          Verify OTP
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Customers List */}
                <div className='bg-gray-50 p-4 rounded-lg'>
                  <h4 className='text-md font-medium text-gray-900 mb-4'>
                    Registered Customers ({customers.length})
                  </h4>

                  {customers.length === 0 ? (
                    <p className='text-gray-500 text-center py-4'>
                      No customers registered yet
                    </p>
                  ) : (
                    <div className='space-y-2 max-h-64 overflow-y-auto'>
                      {customers.map((customer) => (
                        <div
                          key={customer._id}
                          className='flex items-center justify-between bg-white p-3 rounded-md'
                        >
                          <div>
                            <p className='text-sm font-medium text-gray-900'>
                              {customer.phone}
                            </p>
                            <p className='text-xs text-gray-500'>
                              {formatDate(customer.createdAt)}
                            </p>
                          </div>
                          <div className='flex items-center'>
                            {customer.isVerified ? (
                              <CheckCircle className='w-4 h-4 text-green-600' />
                            ) : (
                              <XCircle className='w-4 h-4 text-red-600' />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
