import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/app/services/db';
import { Customer } from '@/app/models/Customer';

// GET /api/campaigns/[id]/customers - Get customers for a campaign
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await db.asPromise();

    const customers = await Customer.find({
      campaignId: campaignId,
      businessId: userId,
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

// POST /api/campaigns/[campaignId]/customers - Register a new customer
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { phone, name } = body;

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    await db.asPromise();

    // Check if customer already exists for this campaign
    const existingCustomer = await Customer.findOne({
      phone,
      campaignId: campaignId,
    });

    if (existingCustomer) {
      return NextResponse.json(
        { error: 'Customer already registered for this campaign' },
        { status: 400 }
      );
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const customer = new Customer({
      phone,
      name,
      campaignId: campaignId,
      businessId: userId,
      otp,
      otpExpiresAt,
    });

    const savedCustomer = await customer.save();

    // In a real app, you would send the OTP via SMS here
    console.log(`OTP for ${phone}: ${otp}`);

    return NextResponse.json(
      {
        message: 'Customer registered successfully. OTP sent.',
        customerId: savedCustomer._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error registering customer:', error);
    return NextResponse.json(
      { error: 'Failed to register customer' },
      { status: 500 }
    );
  }
}
