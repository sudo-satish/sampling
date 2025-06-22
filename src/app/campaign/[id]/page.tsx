'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Plus,
  Users,
  Phone,
  User,
  CheckCircle,
  XCircle,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

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
  name?: string;
  isVerified: boolean;
  createdAt: string;
  verifiedAt?: string;
}

export default function CampaignPage() {
  const params = useParams();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    otp: '',
  });

  useEffect(() => {
    if (campaignId) {
      fetchCampaign();
      fetchCustomers();
    }
  }, [campaignId]);

  const fetchCampaign = async () => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}`);
      if (response.ok) {
        const data = await response.json();
        setCampaign(data);
      } else {
        toast.error('Failed to fetch campaign');
      }
    } catch (error) {
      console.error('Error fetching campaign:', error);
      toast.error('Error fetching campaign');
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/customers`);
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      } else {
        toast.error('Failed to fetch customers');
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Error fetching customers');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: formData.phone,
          name: formData.name || undefined,
        }),
      });

      if (response.ok) {
        setShowOtpInput(true);
        toast.success('Customer registered! Check console for OTP.');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to register customer');
      }
    } catch (error) {
      console.error('Error registering customer:', error);
      toast.error('Error registering customer');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `/api/campaigns/${campaignId}/customers/verify`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone: formData.phone,
            otp: formData.otp,
          }),
        }
      );

      if (response.ok) {
        toast.success('Customer verified successfully!');
        setShowAddModal(false);
        setShowOtpInput(false);
        setFormData({ name: '', phone: '', otp: '' });

        // Refresh data
        fetchCampaign();
        fetchCustomers();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to verify OTP');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error('Error verifying OTP');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-900 mb-4'>
            Campaign not found
          </h1>
          <Link
            href='/dashboard'
            className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors'
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center mb-4'>
            <Link
              href='/dashboard'
              className='flex items-center text-gray-600 hover:text-gray-900 mr-4 transition-colors'
            >
              <ArrowLeft className='w-5 h-5 mr-2' />
              Back to Dashboard
            </Link>
          </div>

          <div className='bg-white rounded-lg shadow-sm p-6'>
            <div className='flex justify-between items-start'>
              <div>
                <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                  {campaign.name}
                </h1>
                <p className='text-gray-600'>
                  Created {formatDate(campaign.createdAt)}
                </p>
              </div>
              <div className='text-right'>
                <div className='flex items-center justify-end mb-2'>
                  <Users className='w-6 h-6 text-blue-600 mr-2' />
                  <span className='text-2xl font-bold text-gray-900'>
                    {campaign.customerCount}
                  </span>
                </div>
                <p className='text-sm text-gray-500'>
                  {campaign.customerCount === 1 ? 'Customer' : 'Customers'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Customers List */}
        <div className='bg-white rounded-lg shadow-sm'>
          <div className='px-6 py-4 border-b border-gray-200'>
            <h2 className='text-lg font-semibold text-gray-900'>Customers</h2>
          </div>

          {customers.length === 0 ? (
            <div className='p-12 text-center'>
              <div className='mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4'>
                <Users className='w-12 h-12 text-gray-400' />
              </div>
              <h3 className='text-lg font-medium text-gray-900 mb-2'>
                No customers yet
              </h3>
              <p className='text-gray-600 mb-6'>
                Start by adding your first customer
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto transition-colors'
              >
                <Plus className='w-5 h-5' />
                Add Customer
              </button>
            </div>
          ) : (
            <div className='p-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {customers.map((customer) => (
                  <div
                    key={customer._id}
                    className='bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow'
                  >
                    <div className='flex items-start justify-between mb-3'>
                      <div className='flex-1'>
                        <div className='flex items-center mb-1'>
                          <User className='w-4 h-4 text-gray-400 mr-2' />
                          <span className='text-sm font-medium text-gray-900'>
                            {customer.name || 'No name'}
                          </span>
                        </div>
                        <div className='flex items-center'>
                          <Phone className='w-4 h-4 text-gray-400 mr-2' />
                          <span className='text-sm text-gray-600'>
                            {customer.phone}
                          </span>
                        </div>
                      </div>
                      <div className='ml-3'>
                        {customer.isVerified ? (
                          <CheckCircle className='w-5 h-5 text-green-600' />
                        ) : (
                          <XCircle className='w-5 h-5 text-red-600' />
                        )}
                      </div>
                    </div>

                    <div className='text-xs text-gray-500'>
                      {customer.isVerified ? (
                        <span>Verified {formatDate(customer.verifiedAt!)}</span>
                      ) : (
                        <span>Registered {formatDate(customer.createdAt)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Add Button */}
      <button
        onClick={() => setShowAddModal(true)}
        className='fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors z-50'
      >
        <Plus className='w-6 h-6' />
      </button>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50'>
          <div className='relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white'>
            <div className='mt-3'>
              <div className='flex justify-between items-center mb-4'>
                <h3 className='text-lg font-medium text-gray-900'>
                  Add New Customer
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowOtpInput(false);
                    setFormData({ name: '', phone: '', otp: '' });
                  }}
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

              {!showOtpInput ? (
                <form onSubmit={handleAddCustomer} className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Name (Optional)
                    </label>
                    <input
                      type='text'
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900'
                      placeholder='Enter customer name'
                      style={{ color: '#111827' }}
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Mobile Number *
                    </label>
                    <input
                      type='tel'
                      required
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900'
                      placeholder='8130626713'
                      style={{ color: '#111827' }}
                    />
                  </div>

                  <div className='flex justify-end space-x-3 pt-4'>
                    <button
                      type='button'
                      onClick={() => {
                        setShowAddModal(false);
                        setFormData({ name: '', phone: '', otp: '' });
                      }}
                      className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors'
                    >
                      Cancel
                    </button>
                    <button
                      type='submit'
                      className='px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors'
                    >
                      Add Customer
                    </button>
                  </div>
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
                      value={formData.otp}
                      onChange={(e) =>
                        setFormData({ ...formData, otp: e.target.value })
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg bg-white text-gray-900'
                      placeholder='123456'
                      style={{ color: '#111827' }}
                    />
                    <p className='text-sm text-gray-500 mt-1'>
                      OTP sent to {formData.phone}
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
          </div>
        </div>
      )}
    </div>
  );
}
