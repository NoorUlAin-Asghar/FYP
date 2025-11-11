// app/sign-in/SignInClient.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEffect } from "react";
import { useState } from "react";
import supabase from "@/lib/supabaseClient";
import { toast } from "sonner";

export default function SignInClient() {
    const searchParams = useSearchParams();
    const err = searchParams.get('error');
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] =useState(false);

    //handling expired login links and unauthorized users
    useEffect(() => {
    if (err==="access_denied")
      toast.error("Login link expired. Please sign in again.");
    else if (err==="unauthorized")
      toast.error("Please sign in to continue.");
  }, [err]);
  

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({ 
      email,});

    if (error) {
      setMessage("Something went wrong. Please try again.");
    } else {
      setMessage("Magic link sent! Check your inbox.");
    }
    setLoading(false);
  };



  return (
    <div>
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gradient-to-r from-[#008080] to-[#00f5f5]">
    <Card className="w-full max-w-sm">
      <CardHeader>
        <h1 className="text-5xl text-center font-bold font-dancing text-black mb-[5vh]">Welcome to PrivaFed</h1>
        <CardTitle>Sign In / Sign Up</CardTitle>
        <CardDescription>
          Enter your email. We&apos;ll send you a login link.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleMagicLink}>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
              />
            </div>
            {/* <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <a
                  href="#"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </a>
              </div>
              <Input id="password" type="password" required />
            </div> */}
          </div>
        </CardContent>
        <CardFooter className="mt-6 flex-col gap-2">
          {loading?  
          <div className="flex justify-center items-center mt-2 space-x-2">
            <div className="w-4 h-4 border-2 border-[#008080] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[#008080] font-dancing font-bold">Sending Link</p>
          </div>
          : 
          <Button type="submit" className="w-full bg-[#008080] hover:bg-[#008080] cursor-pointer active:bg-transparent active:text-[#008080]">
            Send Magic Link
          </Button>
          }
          {message && <p className="text-center text-sm text-gray-700">{message}</p>}
          {/* <div className="flex justify-center items-center text-sm gap-1">
            <span className="text-muted-foreground">Don't have an account?</span>
            <Button variant="link" className="text-[#008080] p-0 h-auto">
              <Link href="/sign-up" className="active:text-black">Sign Up</Link>
            </Button>
          </div> */}
        </CardFooter>
      </form>
    </Card>
    </div>
    </div>
  );
}
