<script lang="ts">
    import { Mail, User, LogOut, GraduationCap } from 'lucide-svelte';
    import { SignOut } from "@auth/sveltekit/components";
    import type { Session } from '@auth/sveltekit';
    // import type { Session } from '@supabase/supabase-js';
    export let session: { 
        user?: { 
            name?: string; 
            email?: string; 
            image?: string; 
            student_id?: string; 
            role?: string 
        } 
    };
</script>

<div class="card bg-base-100 shadow-lg mb-6">
    <div class="card-body p-6">
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
                <div class="avatar">
                    <div class="w-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                        <img src={session.user?.image} alt="User avatar" />
                    </div>
                </div>
                <div>
                    <h2 class="text-2xl font-bold text-base-content">สวัสดี {session.user?.name} 👋</h2>
                    <div class="flex flex-wrap gap-2 mt-1">
                        <div class="badge badge-primary">
                            <Mail class="w-3 h-3 mr-1" />
                            {session.user?.email}
                        </div>
                        {#if session.user?.student_id}
                        <div class="badge badge-secondary">
                            <GraduationCap class="w-3 h-3 mr-1" />
                            รหัสนักศึกษา: {session.user.student_id}
                        </div>
                        {/if}
                        <div class="badge badge-accent">
                            <User class="w-3 h-3 mr-1" />
                            {session.user?.role || 'student'}
                        </div>
                    </div>
                </div>
            </div>
            <div class="flex gap-2">
                <SignOut redirectTo="/auth">
                    <div slot="submitButton" class="btn btn-outline btn-sm">
                        <LogOut class="w-4 h-4" />
                        ออกจากระบบ
                    </div>
                </SignOut>
            </div>
        </div>
    </div>
</div>