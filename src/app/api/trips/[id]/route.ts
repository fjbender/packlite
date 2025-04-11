import { NextResponse } from 'next/server';
import dbConnect from '@/lib/utils/mongodb';
import Trip from '@/lib/models/Trip';
import { auth } from '@/app/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
    
    const { id: tripId } = await params;
    
    const trip = await Trip.findOne({ 
      _id: tripId,
      userId: session.user.id 
    });
    
    if (!trip) {
      return NextResponse.json(
        { success: false, error: 'Trip not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: trip });
  } catch (error) {
    const { id } = await params;
    console.error(`Error fetching trip ${id}:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trip' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
    
    const { id: tripId } = await params;
    const data = await request.json();
    
    const updatedTrip = await Trip.findOneAndUpdate(
      { _id: tripId, userId: session.user.id },
      data,
      { new: true, runValidators: true }
    );
    
    if (!updatedTrip) {
      return NextResponse.json(
        { success: false, error: 'Trip not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: updatedTrip });
  } catch (error) {
    const { id } = await params;
    console.error(`Error updating trip ${id}:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to update trip' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
    
    const { id: tripId } = await params;
    
    const deletedTrip = await Trip.findOneAndDelete({
      _id: tripId,
      userId: session.user.id
    });
    
    if (!deletedTrip) {
      return NextResponse.json(
        { success: false, error: 'Trip not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      data: { message: 'Trip deleted successfully' } 
    });
  } catch (error) {
    const { id } = await params;
    console.error(`Error deleting trip ${id}:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete trip' },
      { status: 500 }
    );
  }
}