<script lang="ts">
    import { Home, Calendar, Moon, Sun, User, LogOut } from "lucide-svelte";
    import { SignOut } from "@auth/sveltekit/components";
    import { onMount } from "svelte";

    import type { User as UserData } from '$lib/shared/types';

    export let session: { 
        user?: UserData
    } | null = null;

    let currentTheme = 'light';
    
    onMount(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        currentTheme = savedTheme;
        document.documentElement.setAttribute('data-theme', savedTheme);
    });

    function toggleTheme() {
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        currentTheme = newTheme;
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }
</script>

<!-- Navbar -->
<div class="navbar bg-accent-qss text-primary-content shadow-lg sticky top-0 z-50">
    <div class="navbar-start">
        <a href="/" class="btn btn-ghost text-xl font-bold">🍽️ QuickSciSeat</a>
    </div>
    
    <div class="navbar-center hidden lg:flex">
        <ul class="menu menu-horizontal px-1">
            <li><a href="/" class="active"><Home class="w-4 h-4" />Homepage</a></li>
            <li><a href="/"><Calendar class="w-4 h-4" />My Reservation</a></li>
        </ul>
    </div>
    
    <div class="navbar-end gap-2">
        <button class="btn btn-ghost btn-circle" on:click={toggleTheme}>
            {#if currentTheme === 'light'}<Moon class="w-5 h-5" />{:else}<Sun class="w-5 h-5" />{/if}
        </button>
        
        {#if session?.user}
            <div class="dropdown dropdown-end">
                <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
                    <div class="w-10 rounded-full">
                        <img alt="Profile" src={session.user?.image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"} />
                    </div>
                </div>
                <ul class="mt-3 z-50 p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
                    <li class="menu-title">
                        <span class="text-base-content">{session.user?.name || 'ผู้ใช้'}</span>
                        <span class="text-xs opacity-60">{session.user?.role || 'นักศึกษา'}</span>
                    </li>
                    <li><a href="/profile" class="text-base-content"><User class="w-4 h-4" />Profile</a></li>
                    <li><hr class="my-1"></li>
                    <li>
                        <button on:click={toggleTheme} class="text-base-content">
                            {#if currentTheme === 'light'}<Moon class="w-4 h-4" />Dark Mode{:else}<Sun class="w-4 h-4" />Light Mode{/if}
                        </button>
                    </li>
                    <li><hr class="my-1"></li>
                    <li>
                        <SignOut redirectTo="/auth">
                            <div slot="submitButton" class="text-error w-full text-left">
                                <LogOut class="w-4 h-4 inline mr-2" />Sign Out
                            </div>
                        </SignOut>
                    </li>
                </ul>
            </div>
        {:else}
            <a href="/auth" class="btn btn-ghost btn-sm">
                <LogOut class="w-4 h-4" />
                เข้าสู่ระบบ
            </a>
        {/if}
    </div>
</div>