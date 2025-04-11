import { NextResponse } from 'next/server';
import dbConnect from '@/lib/utils/mongodb';
import Gear from '@/lib/models/Gear';
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
    
    const { id: gearId } = await params;
    
    const gearItem = await Gear.findOne({ 
      _id: gearId,
      userId: session.user.id 
    });
    
    if (!gearItem) {
      return NextResponse.json(
        { success: false, error: 'Gear item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: gearItem });
  } catch (error) {
    const { id } = await params;
    console.error(`Error fetching gear item ${id}:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch gear item' },
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
    
    const { id: gearId } = await params;
    const data = await request.json();
    
    const updatedGearItem = await Gear.findOneAndUpdate(
      { _id: gearId, userId: session.user.id },
      data,
      { new: true, runValidators: true }
    );
    
    if (!updatedGearItem) {
      return NextResponse.json(
        { success: false, error: 'Gear item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: updatedGearItem });
  } catch (error) {
    const { id } = await params;
    console.error(`Error updating gear item ${id}:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to update gear item' },
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
    
    const { id: gearId } = await params;
    
    const deletedGearItem = await Gear.findOneAndDelete({
      _id: gearId,
      userId: session.user.id
    });
    
    if (!deletedGearItem) {
      return NextResponse.json(
        { success: false, error: 'Gear item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      data: { message: 'Gear item deleted successfully' } 
    });
  } catch (error) {
    const { id } = await params;
    console.error(`Error deleting gear item ${id}:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete gear item' },
      { status: 500 }
    );
  }
}