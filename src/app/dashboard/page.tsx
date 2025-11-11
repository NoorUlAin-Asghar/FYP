"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/protectedRoute";
import { getUserPitchesWithEmail } from "@/lib/pitch-db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { saveChangesToDb, deletePitchFromDb } from "@/lib/pitch-db";
import { motion } from "framer-motion";
import { Plus } from "lucide-react"
import { toast } from "sonner";

type Pitch = {
  id: string;
  title: string;
  body: string;
  created_at: Date; 
};


export default function Dashboard() {
  const [userEmail, setUserEmail] = useState("");
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [count,setCount]=useState(0)
  const router = useRouter();
  const [selectedPitch, setSelectedPitch] = useState<Pitch | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedBody, setEditedBody] = useState("");
  const [loading,setLoading]=useState(false)
  const [message, setMessage]= useState<string | null>(null);
  const [status,setStatus]=useState<string | null>(null);

  useEffect(() => {
    getData();
  }, []);

  //show required toast message (successful or unsuccessful deletion/editing of pitch)
  useEffect(() => {
    if (status==="success")
      toast.success(message)
    else if(status==="danger")
      toast.error(message)

  }, [message,status]);

    //fetching data from db
    const getData = async () => {
    try {
      setLoading(true)
      const data = await getUserPitchesWithEmail();
      setUserEmail(data?.email || "Guest");
      setPitches(data?.pitches || []);
      setCount(data?.count || 0);
    } catch (error) {
      console.error("Failed to get Data");
    }
    finally{
      setLoading(false);
    }
  };

  //redirect to generate page
  const handleNewPitch = () => {
    router.push("/generate");
  };
  
  const editPitch = async (id: string, newTitle: string, newBody: string) => {
    try{
      setLoading(true);
      console.log("Saving")
      // console.log("Saving", id, newTitle, newBody);
      const res=await saveChangesToDb(id,newTitle,newBody)
      setMessage(res.message);
      setStatus(res.status)
      await getData();
    }
    finally{
      setLoading(false)
    }
  };

  const deletePitch = async (id: string) => {
    try{
      setLoading(true)
      console.log("Deleting")
      // console.log("Deleting", id);
      const res=await deletePitchFromDb(id)
      setMessage(res.message);
      setStatus(res.status)
      await getData();
      
    }
    finally{
      setLoading(false)
    }
  };

  //loading screen
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gradient-to-r from-[#008080] to-[#00f5f5]">
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/20 backdrop-blur-sm">
          <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin mr-4"></div>
          <p className="text-white font-dancing text-6xl font-bold">Loading...</p>
        </div>
      </div>
    );
  }


  return (
    <ProtectedRoute>
      <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-5xl font-bold mb-2 text-black font-dancing">Dashboard</h1>
              <p className="text-gray-600">Welcome, <span className="font-medium text-[#008080]">{userEmail}</span></p>
              <p className="text-gray-600 font-mdeium">Your personal space to create and track ideas ✨</p>
            </div>
            <button
              onClick={handleNewPitch}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-[#008080] text-white rounded-2xl shadow-md hover:bg-teal-800 transition-all duration-300 ease-in-out font-semibold text-base tracking-wide hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Generate New Pitch
            </button>
          </div>

          <div className="flex justify-between items-center mt-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Total Pitches</h2>
              <p className="text-2xl font-bold text-[#008080]">{count}</p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Previous Pitches</h2>
            {pitches.length === 0 ? (
              <p className="text-gray-500">You haven`&apos;`t generated any pitches yet.</p>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              > {/*sheet component to edit or delete*/}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pitches.map((pitch,i) => (
                  <Sheet key={i}>
                    <SheetTrigger asChild>
                      <div
                        onClick={() => {
                          setSelectedPitch(pitch);
                          setEditedTitle(pitch.title || "");
                          setEditedBody(pitch.body || "");
                        }}
                        className="bg-[#008080] text-white p-4 rounded-md hover:drop-shadow-2xl transition hover:cursor-pointer "
                      >
                        <h3 className="font-medium truncate">{pitch.title || "Untitled Pitch"}</h3>
                        <p className="text-sm text-white mt-1 italic truncate">{pitch.body}</p>
                        <p className="mt-6 text-xs text-gray-100">
                          {new Date(pitch.created_at).toLocaleString()}
                        </p>
                      </div>
                    </SheetTrigger>

                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Edit Pitch</SheetTitle>
                        <SheetDescription>
                          Update your pitch title or body. Save to apply changes or delete permanently.
                        </SheetDescription>
                      </SheetHeader>
                      <div className="grid flex-1 auto-rows-min gap-6 px-4 mt-4">
                        <div className="grid gap-3">
                          <Label htmlFor="pitch-title">Title</Label>
                          <Input
                            id="pitch-title"
                            value={editedTitle}
                            onChange={(e) => setEditedTitle(e.target.value)}
                          />
                        </div>
                        <div className="grid gap-3">
                          <Label htmlFor="pitch-body">Body</Label>
                          <Textarea
                            id="pitch-body"
                            value={editedBody}
                            onChange={(e) => setEditedBody(e.target.value)}
                            className="w-full p-2 border rounded-md resize-none  max-h-[50vh] overflow-y-auto text-black"
                          />
                        </div>
                      </div>
                      <SheetFooter className="mt-0 pt-0 flex flex-row justify-center">
                        <SheetClose asChild>
                          <Button
                            variant="destructive"
                            onClick={() => selectedPitch && deletePitch(selectedPitch.id)}
                            className="flex-1 hover:bg-destructive cursor-pointer active:bg-transparent active:text-destructive"
                          >
                            Delete
                          </Button>
                        </SheetClose>
                        <SheetClose asChild>
                          <Button className= "flex-1 bg-[#008080] hover:bg-[#008080] cursor-pointer active:bg-transparent active:text-[#008080]"
                            onClick={() =>
                              selectedPitch &&
                              editPitch(selectedPitch.id, editedTitle, editedBody)
                            }
                          >
                            Save Changes
                          </Button>
                        </SheetClose>
                      </SheetFooter>
                    </SheetContent>
                  </Sheet>
                ))}
              </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
