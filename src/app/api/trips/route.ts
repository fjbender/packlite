import { NextResponse } from 'next/server';
import dbConnect from '@/lib/utils/mongodb';
import Trip from '@/lib/models/Trip';
import { auth } from '@/app/auth';

export async function GET() {
  try {
    await dbConnect();
    
    // Get the authenticated session
    const session = await auth();
    
    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get all trip items for the authenticated user
    const trips = await Trip.find({ userId: session.user.id })
      .sort({ startDate: -1 });
    
    return NextResponse.json({ success: true, data: trips });
  } catch (error) {
    console.error('Error fetching trips:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trips' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    
    // Get the authenticated session
    const session = await auth();
    
    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const data = await request.json();
    
    // Add the user ID to the trip
    const tripData = {
      ...data,
      userId: session.user.id,
    };
    
    // Create a new trip
    const newTrip = await Trip.create(tripData);
    
    return NextResponse.json(
      { success: true, data: newTrip },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating trip:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create trip' },
      { status: 500 }
    );
  }
}