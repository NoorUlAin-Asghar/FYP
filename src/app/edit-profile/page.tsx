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
import Image from "next/image";

export default function EditProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

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
        .select("full_name, bio, avatar_url")
        .eq("id", user.id)
        .single();

      if (data) {
        setName(data.full_name || "");
        setBio(data.bio || "");
        setAvatarUrl(data.avatar_url || null);
      }

      setLoading(false);
    };

    loadProfile();
  }, [router]);

  /* ---------------- Save profile ---------------- */
  const handleSave = async () => {
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let uploadedAvatarUrl = avatarUrl;

    if (avatarFile) {
      const fileExt = avatarFile.name.split(".").pop();
      const filePath = `${user.id}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatarFile, { upsert: true });

      if (uploadError) {
        toast.error("Failed to upload image");
        setSaving(false);
        return;
      }

      const { data } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      uploadedAvatarUrl = data.publicUrl;
    }

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: name,
      bio,
      avatar_url: uploadedAvatarUrl,
    });

    if (error) {
      toast.error("Failed to save profile");
    } else {
      toast.success("Profile updated successfully");
      router.push("/dashboard");
    }

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
          {/* Avatar */}
          <div className="flex flex-col items-center gap-4">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="Profile"
                width={120}
                height={120}
                className="rounded-full border"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                No Image
              </div>
            )}

            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
            />
          </div>

          {/* Name */}
          <div>
            <Label>Full Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          {/* Email (readonly) */}
          <div>
            <Label>Email</Label>
            <Input value={email} disabled />
          </div>

          {/* Bio */}
          <div>
            <Label>Bio</Label>
            <Input
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell something about yourself"
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#008080] hover:bg-[#008080]"
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
