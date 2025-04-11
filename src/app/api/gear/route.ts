import { NextResponse } from 'next/server';
import dbConnect from '@/lib/utils/mongodb';
import Gear from '@/lib/models/Gear';
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
    
    // Get all gear items for the authenticated user
    const gearItems = await Gear.find({ userId: session.user.id }).sort({ category: 1, name: 1 });
    
    return NextResponse.json({ success: true, data: gearItems });
  } catch (error) {
    console.error('Error fetching gear items:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch gear items' },
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
    
    // Add the user ID to the gear item
    const gearData = {
      ...data,
      userId: session.user.id,
    };
    
    // Create a new gear item
    const newGear = await Gear.create(gearData);
    
    return NextResponse.json(
      { success: true, data: newGear },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating gear item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create gear item' },
      { status: 500 }
    );
  }
}