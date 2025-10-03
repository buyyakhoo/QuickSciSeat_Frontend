import { SvelteKitAuth, type User } from "@auth/sveltekit"
import Google from "@auth/sveltekit/providers/google"

import { AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET, AUTH_SECRET } from '$env/static/private';

export const { handle, signIn, signOut } = SvelteKitAuth(async (event) => {
    const authOptions = {
        providers: [
            Google({
                clientId: AUTH_GOOGLE_ID,
                clientSecret: AUTH_GOOGLE_SECRET
            })
        ],
        secret: AUTH_SECRET,
        trustHost: true,
        debug: true,
        callbacks: {
            async signIn({ user, account, profile }: { user: User, account?: any, profile?: any }) {

                if (user.email?.endsWith('@kmitl.ac.th')) {
                    return true;
                }
                return false; // ปฏิเสธ email อื่น ๆ
            },
            async session({ session, token }: { session: Record<string, any>, token: any }) {
                // เพิ่มข้อมูลเพิ่มเติมใน session
                if (session.user?.email) {
                    // ตัวอย่างการดึงข้อมูลนักศึกษา
                    const userData = await getUserData(session.user.email);
                    
                    session.user = {
                        ...session.user,
                        student_id: userData?.student_id,
                        role: userData?.role || 'student'
                    };
                }
                return {
                    ...session,
                    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString() // Example: 7 days from now
                };
            }
        }
    }
    return authOptions;
});

// ฟังก์ชันจำลองการดึงข้อมูลผู้ใช้
async function getUserData(email: string) {
    // แยก username จาก email (ก่อน @)
    const username = email.split('@')[0];
    
    // เอา 8 หลักแรกของ username เป็น student_id
    const student_id = username.substring(0, 8);
    
    return {
        student_id: student_id,
        role: 'student'
    };
}