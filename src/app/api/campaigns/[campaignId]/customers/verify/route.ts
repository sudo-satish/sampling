import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/app/services/db';
import { Customer } from '@/app/models/Customer';
import { Campaign } from '@/app/models/Campaign';

// POST /api/campaigns/[campaignId]/customers/verify - Verify customer OTP
export async function POST(
  request: NextRequest,
  { params }: { params: { campaignId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { phone, otp } = body;

    if (!phone || !otp) {
      return NextResponse.json(
        { error: 'Phone number and OTP are required' },
        { status: 400 }
      );
    }

    await db.asPromise();

    // Find the customer
    const customer = await Customer.findOne({
      phone,
      campaignId: params.campaignId,
      businessId: userId,
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Check if already verified
    if (customer.isVerified) {
      return NextResponse.json(
        { error: 'Customer already verified' },
        { status: 400 }
      );
    }

    // Check if OTP is expired
    if (new Date() > customer.otpExpiresAt) {
      return NextResponse.json({ error: 'OTP has expired' }, { status: 400 });
    }

    // Verify OTP
    if (customer.otp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    // Update customer verification status
    customer.isVerified = true;
    customer.verifiedAt = new Date();
    await customer.save();

    // Update campaign customer count
    await Campaign.findByIdAndUpdate(params.campaignId, {
      $inc: { customerCount: 1 },
    });

    return NextResponse.json({
      message: 'Customer verified successfully',
      customer: {
        _id: customer._id,
        phone: customer.phone,
        name: customer.name,
        isVerified: customer.isVerified,
        verifiedAt: customer.verifiedAt,
      },
    });
  } catch (error) {
    console.error('Error verifying customer:', error);
    return NextResponse.json(
      { error: 'Failed to verify customer' },
      { status: 500 }
    );
  }
}
