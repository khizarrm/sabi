import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Using service role key for admin operations
);

interface CreateTaskPayload {
  customerId: string;
  title: string;
  description: string;
  taskAddress: string;
  fixedPrice: number;
  taskType?: 'on_demand' | 'scheduled';
  preferredStartTime?: string;
  preferredEndTime?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body: CreateTaskPayload = await request.json();
    
    // Validate required fields
    const { customerId, title, description, taskAddress, fixedPrice } = body;
    
    if (!customerId || !title || !description || !taskAddress || fixedPrice == null) {
      return NextResponse.json(
        { error: 'Missing required fields: customerId, title, description, taskAddress, fixedPrice' },
        { status: 400 }
      );
    }

    // Validate price
    if (fixedPrice <= 0) {
      return NextResponse.json(
        { error: 'Fixed price must be greater than 0' },
        { status: 400 }
      );
    }

    // Validate customer exists and is active
    const { data: customer, error: customerError } = await supabase
      .from('users')
      .select('id, first_name, is_active')
      .eq('id', customerId)
      .eq('is_active', true)
      .single();

    if (customerError || !customer) {
      return NextResponse.json(
        { error: 'Customer not found or inactive' },
        { status: 404 }
      );
    }

    // Prepare task data
    const taskData = {
      customer_id: customerId,
      title: title.trim(),
      description: description.trim(),
      task_address: taskAddress.trim(),
      budget_min: fixedPrice, // Keep these for now even though we're using fixed price
      budget_max: fixedPrice, // Will help with schema compatibility
      task_type: body.taskType || 'on_demand',
      preferred_start_time: body.preferredStartTime || null,
      preferred_end_time: body.preferredEndTime || null,
      status: 'posted',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Create the task
    const { data: newTask, error: taskError } = await supabase
      .from('tasks')
      .insert(taskData)
      .select()
      .single();

    if (taskError) {
      console.error('Error creating task:', taskError);
      return NextResponse.json(
        { error: 'Failed to create task' },
        { status: 500 }
      );
    }

    console.log(`Task created: ${newTask.id} by customer ${customerId}`);

    // Trigger notifications to all available users
    try {
      const notifyResponse = await fetch(`${request.nextUrl.origin}/api/tasks/notify-available`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId: newTask.id,
          title: newTask.title,
          description: newTask.description,
          fixedPrice: fixedPrice,
          taskAddress: newTask.task_address,
          customerId: customerId
        })
      });

      const notifyResult = await notifyResponse.json();
      
      if (!notifyResponse.ok) {
        console.error('Failed to send notifications:', notifyResult);
        // Don't fail task creation if notifications fail
      } else {
        console.log(`Notifications sent for task ${newTask.id}:`, notifyResult);
      }

      return NextResponse.json({
        message: 'Task created successfully',
        task: {
          id: newTask.id,
          title: newTask.title,
          description: newTask.description,
          task_address: newTask.task_address,
          fixed_price: fixedPrice,
          task_type: newTask.task_type,
          status: newTask.status,
          created_at: newTask.created_at
        },
        notifications: {
          sent: notifyResult.fcm_notifications_sent || 0,
          total_available_users: notifyResult.total_available_users || 0,
          users_with_valid_tokens: notifyResult.users_with_valid_tokens || 0
        }
      });

    } catch (notifyError) {
      console.error('Error triggering notifications:', notifyError);
      
      // Return success for task creation even if notifications failed
      return NextResponse.json({
        message: 'Task created successfully (notifications failed)',
        task: {
          id: newTask.id,
          title: newTask.title,
          description: newTask.description,
          task_address: newTask.task_address,
          fixed_price: fixedPrice,
          task_type: newTask.task_type,
          status: newTask.status,
          created_at: newTask.created_at
        },
        notifications: {
          sent: 0,
          error: 'Failed to send notifications'
        }
      });
    }

  } catch (error) {
    console.error('Error in create task route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optional: Add GET method for testing
export async function GET() {
  return NextResponse.json({
    message: 'POST /api/tasks/create - Create a new task and notify available users',
    required_fields: ['customerId', 'title', 'description', 'taskAddress', 'fixedPrice'],
    optional_fields: ['taskType', 'preferredStartTime', 'preferredEndTime'],
    example: {
      customerId: 'uuid-here',
      title: 'Fix my leaky faucet',
      description: 'Kitchen faucet has been dripping for 2 days...',
      taskAddress: '123 Main St, Anytown, USA',
      fixedPrice: 75,
      taskType: 'on_demand'
    }
  });
}
