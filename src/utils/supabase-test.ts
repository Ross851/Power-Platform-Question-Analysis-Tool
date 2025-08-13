import { supabase } from '@/lib/supabase';

export async function testSupabaseConnection() {
  try {
    console.log('🔄 Testing Supabase connection...');
    
    // Test 1: Check if client is initialized
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }
    console.log('✅ Supabase client initialized');
    
    // Test 2: Try to fetch from a public table (questions)
    const { data, error, count } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      return {
        connected: false,
        error: error.message,
        details: {
          code: error.code,
          details: error.details,
          hint: error.hint
        }
      };
    }
    
    console.log('✅ Database connection successful');
    console.log(`📊 Questions table has ${count || 0} records`);
    
    // Test 3: Check auth status
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.warn('⚠️ Auth check failed:', authError.message);
    } else if (session) {
      console.log('✅ User authenticated:', session.user?.email);
    } else {
      console.log('ℹ️ No active session (user not logged in)');
    }
    
    // Test 4: Check real-time connection (optional)
    const channel = supabase
      .channel('test-channel')
      .on('system', { event: '*' }, (payload) => {
        console.log('📡 Realtime event:', payload);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Realtime connection established');
          channel.unsubscribe();
        }
      });
    
    // Give realtime a moment to connect
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      connected: true,
      hasQuestions: (count || 0) > 0,
      questionCount: count || 0,
      authenticated: !!session,
      user: session?.user?.email || null
    };
    
  } catch (error: any) {
    console.error('❌ Connection test failed:', error);
    return {
      connected: false,
      error: error.message || 'Unknown error',
      details: error
    };
  }
}

export async function loadSampleQuestions() {
  try {
    console.log('📥 Loading sample questions...');
    
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('❌ Failed to load questions:', error);
      return { success: false, error: error.message, questions: [] };
    }
    
    if (!data || data.length === 0) {
      console.log('⚠️ No questions found in database');
      return { success: true, questions: [], message: 'No questions in database' };
    }
    
    console.log(`✅ Loaded ${data.length} sample questions`);
    data.forEach((q: any, i: number) => {
      console.log(`  ${i + 1}. ${q.question_text?.substring(0, 50)}...`);
    });
    
    return { success: true, questions: data };
    
  } catch (error: any) {
    console.error('❌ Error loading questions:', error);
    return { success: false, error: error.message, questions: [] };
  }
}

export async function checkTableSchema() {
  try {
    console.log('🔍 Checking table schema...');
    
    // Get table columns info
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Schema check failed:', error);
      return { success: false, error: error.message };
    }
    
    if (data && data.length > 0) {
      const columns = Object.keys(data[0]);
      console.log('📋 Table columns:', columns);
      return { success: true, columns };
    }
    
    return { success: true, columns: [], message: 'Table exists but is empty' };
    
  } catch (error: any) {
    console.error('❌ Schema check error:', error);
    return { success: false, error: error.message };
  }
}

// Export a function to run all tests
export async function runAllSupabaseTests() {
  console.log('🚀 Starting Supabase diagnostics...\n');
  
  const connectionTest = await testSupabaseConnection();
  console.log('\n📊 Connection Test Results:', connectionTest);
  
  if (connectionTest.connected) {
    const schemaTest = await checkTableSchema();
    console.log('\n📋 Schema Test Results:', schemaTest);
    
    const questionsTest = await loadSampleQuestions();
    console.log('\n📚 Questions Test Results:', {
      success: questionsTest.success,
      count: questionsTest.questions?.length || 0,
      error: questionsTest.error
    });
  }
  
  console.log('\n✨ Diagnostics complete!');
  return {
    connection: connectionTest,
    testsRun: connectionTest.connected ? 3 : 1
  };
}

// Auto-run tests if this file is accessed directly (for debugging)
if (import.meta.env.DEV) {
  // Make function available on window for console testing
  (window as any).testSupabase = runAllSupabaseTests;
  (window as any).supabaseTests = {
    testConnection: testSupabaseConnection,
    loadQuestions: loadSampleQuestions,
    checkSchema: checkTableSchema
  };
  
  console.log('💡 Supabase test utilities loaded. Run window.testSupabase() in console to test connection.');
}