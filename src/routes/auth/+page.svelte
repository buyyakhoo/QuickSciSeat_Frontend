<script lang="ts">
  import '../../app.css';
  import { goto } from '$app/navigation';
  import { LogIn } from 'lucide-svelte';
  
  let isLoading = false;
  let selectedUser: keyof typeof mockUsers = 'student'; // Default selection
  
  // Mock user data
  const mockUsers = {
    student: {
      google_id: "123456789",
      email: "john.doe@kmitl.ac.th",
      name: "John Doe",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      role: "student",
      student_id: "66050123"
    }
  };
  
  async function handleGoogleSignIn() {
    isLoading = true;
    
    try {
      // จำลอง Google OAuth flow
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const userData = mockUsers[selectedUser];
      
      // จำลองการบันทึก session
      localStorage.setItem('user_session', JSON.stringify({
        user: userData,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        session_id: Math.random().toString(36).substring(7)
      }));
      
      // Redirect ไปหน้าหลัก
      goto('/');
      
    } catch (error) {
      console.error('Login failed:', error);
      alert('เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>เข้าสู่ระบบ - QuickSciSeat</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary via-primary to-secondary">
  <div class="card w-full max-w-md bg-base-100 shadow-2xl">
    <div class="card-body p-8 text-center">
      <!-- Logo -->
      <div class="text-6xl mb-4">🍽️</div>
      <h1 class="text-3xl font-bold text-base-content mb-2">QuickSciSeat</h1>
      <p class="text-base-content/70 mb-6">ระบบจองโต๊ะอาหาร คณะวิทยาศาสตร์</p>
      
      <!-- Selected User Preview -->
      <div class="card bg-base-200 mb-6">
        <div class="card-body p-4">
          <div class="flex items-center gap-3">
            <div class="avatar">
              <div class="w-12 rounded-full">
                <img src={mockUsers[selectedUser].avatar} alt="avatar" />
              </div>
            </div>
            <div class="text-left">
              <div class="font-bold">{mockUsers[selectedUser].name}</div>
              <div class="text-sm opacity-70">{mockUsers[selectedUser].email}</div>
              <div class="badge badge-sm badge-primary">{mockUsers[selectedUser].role}</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Google OAuth Button (Mock) -->
      <button
        class="btn btn-primary btn-lg w-full shadow-lg"
        disabled={isLoading}
        on:click={handleGoogleSignIn}
      >
        {#if isLoading}
          <span class="loading loading-spinner loading-md"></span>
          กำลังเข้าสู่ระบบ...
        {:else}
          <LogIn class="w-6 h-6" />
          เข้าสู่ระบบด้วย Google (Mock)
        {/if}
      </button>
      
      <div class="text-xs text-base-content/50 mt-6">
        <p>© 2024 Science Faculty, KMITL</p>
        <p class="mt-2 text-warning">โหมดทดสอบ - ไม่เชื่อมต่อ Google จริง</p>
      </div>
    </div>
  </div>
</div>