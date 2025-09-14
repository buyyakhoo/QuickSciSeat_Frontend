import { handle as authHandle } from "./auth.ts.bak"
import { sequence } from "@sveltejs/kit/hooks"

export const handle = sequence(authHandle)