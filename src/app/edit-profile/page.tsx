"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function EditProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState(""); // 🔹 Added
  const [gender, setGender] = useState(""); // 🔹 Added
  const [cnic, setCnic] = useState("");
  const [dob, setDob] = useState("");
  const [hasProfile, setHasProfile] = useState(false); // 🔹 Track existing profile

  /* ---------------- Load user data ---------------- */
  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (!user || error) {
        router.push("/sign-in");
        return;
      }

      setEmail(user.email || "");

      const { data } = await supabase
        .from("profiles")
        .select("full_name, phone, gender, cnic, dob") // 🔹 Updated columns
        .eq("id", user.id)
        .maybeSingle(); // 🔹 Fixed: Use maybeSingle to avoid error for new users

      if (data) {
        setName(data.full_name || "");
        setPhone(data.phone || ""); // 🔹 Added
        setGender(data.gender || ""); // 🔹 Added
        setCnic(data.cnic || "");
        setDob(data.dob || "");
        setHasProfile(true); // 🔹 Mark profile exists
      }

      setLoading(false);
    };

    loadProfile();
  }, [router]);

  /* ---------------- Save profile ---------------- */
  const handleSave = async () => {
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Not authenticated");
      setSaving(false);
      return;
    }

    // Validation
    if (!name.trim()) {
      toast.error("Full name is required");
      setSaving(false);
      return;
    }

    if (!hasProfile && !cnic.trim()) {
      toast.error("CNIC is required for initial profile creation");
      setSaving(false);
      return;
    }

    // Check if profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("id, cnic")
      .eq("id", user.id)
      .maybeSingle();

    if (fetchError) {
      toast.error(fetchError.message);
      setSaving(false);
      return;
    }

    // 2️⃣ UPDATE (NO CNIC)
    if (existingProfile) {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: name,
          phone, // 🔹 Added
          gender, // 🔹 Added
          dob: dob,
          updated_at: new Date().toISOString(),
          // ❌ Removed: bio, avatar_url
        })
        .eq("id", user.id);

      if (error) {
        toast.error(error.message);
        setSaving(false);
        return;
      }
    }

    // 3️⃣ INSERT (CNIC allowed ONCE)
    else {
      const { error } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          email: user.email, // 🔹 Added (schema requires this)
          full_name: name,
          phone: phone || null, // 🔹 Added
          gender: gender || null, // 🔹 Added
          cnic: cnic || null,
          dob: dob || null,
          updated_at: new Date().toISOString(),
          // ❌ Removed: bio, avatar_url
        });

      if (error) {
        toast.error(error.message);
        setSaving(false);
        return;
      }
    }

    toast.success("Profile saved successfully");
    router.push("/dashboard");
    setSaving(false);
  };

  if (loading) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#008080] to-[#00f5f5]">
      <Card className="w-full max-w-2xl shadow-xl my-20">
        <CardHeader>
          <CardTitle className="text-5xl text-center font-dancing font-bold">
            Edit Profile
          </CardTitle>
          <CardDescription className="text-center">
            Update your personal information
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Name */}
          <div>
            <Label>Full Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          {/* Email */}
          <div>
            <Label>Email</Label>
            <Input value={email} disabled />
          </div>

          {/* 🔹 Phone */}
          <div>
            <Label>Phone</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0300-1234567"
              type="tel"
            />
          </div>

          {/* 🔹 Gender */}
          <div>
            <Label>Gender</Label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* CNIC */}
          <div>
            <Label>CNIC {!hasProfile && "*"}</Label>
            <Input
              value={cnic}
              onChange={(e) => setCnic(e.target.value)}
              placeholder="12345-1234567-1"
              disabled={hasProfile} // 🔹 Fixed: Disable based on profile existence
            />
            {hasProfile && (
              <p className="text-xs text-muted-foreground mt-1">
                CNIC cannot be changed once saved
              </p>
            )}
          </div>

          {/* DOB */}
          <div>
            <Label>Date of Birth</Label>
            <Input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#008080] hover:bg-[#006666]"
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}