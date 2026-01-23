"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/protectedRoute";
import { getUserPatientsWithEmail } from "@/lib/patient-db";
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
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { saveChangesToDb, deletePitchFromDb } from "@/lib/patient-db";
import { motion } from "framer-motion";
import { Plus } from "lucide-react"
import { toast } from "sonner";

type Patient = {
  patient_id: string;
  cnic: string;
  name: string;
  dob: Date;
  gender: string;
  created_at: Date; 
};


export default function Dashboard() {
  const [userEmail, setUserEmail] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [count,setCount]=useState(0)
  const router = useRouter();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [editedName, setEditedName] = useState("");
  const [editedDOB, setEditedDOB] = useState<Date>(new Date());
  const [editedGender, setEditedGender] = useState("");
  const [loading,setLoading]=useState(false)
  const [message, setMessage]= useState<string | null>(null);
  const [status,setStatus]=useState<string | null>(null);
  const [open, setOpen] = useState(false)

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
      const data = await getUserPatientsWithEmail();
      setUserEmail(data?.email || "Guest");
      setPatients(data?.patients || []);
      setCount(data?.count || 0);
    } catch (error) {
      console.error("Failed to get Data");
    }
    finally{
      setLoading(false);
    }
  };

  //redirect to generate page
  const handleNewPatient = () => {
    router.push("/addPatient");
  };
  
  const editPitch = async (id: string, newName: string, newDOB: Date, newGender: string) => {
    try{
      setLoading(true);
      console.log("Saving")
      // console.log("Saving", id, newTitle, newBody);
      const res=await saveChangesToDb(id,newName,newDOB, newGender)
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

  // 1️⃣ Sort patients alphabetically
  const sortedPatients = [...patients].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  // 2️⃣ Group by first letter
  const groupedPatients = sortedPatients.reduce<Record<string, Patient[]>>(
    (acc, patient) => {
      const letter = patient.name.charAt(0).toUpperCase();
      if (!acc[letter]) acc[letter] = [];
      acc[letter].push(patient);
      return acc;
    },
    {}
  );

  // 3️⃣ Get ordered alphabet keys
  const alphabetKeys = Object.keys(groupedPatients).sort();

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
              <p className="text-gray-600 font-mdeium">Your personal space to manage your patients ✨</p>
            </div>
            <button
              onClick={handleNewPatient}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-[#008080] text-white rounded-2xl shadow-md hover:bg-teal-800 transition-all duration-300 ease-in-out font-semibold text-base tracking-wide hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Add New Patient
            </button>
          </div>

          <div className="flex justify-between items-center mt-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Total Patients</h2>
              <p className="text-2xl font-bold text-[#008080]">{count}</p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Patients</h2>
            {patients.length === 0 ? (
              <p className="text-gray-500">You haven&apos;t added any patients yet. Click the 'Add New Patient' button to get started.</p>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                {alphabetKeys.map((letter) => (
                  <div key={letter} className="space-y-3">
                    {/* Sticky alphabet header */}
                    <div className="sticky top-0 z-10 bg-white py-1">
                      <h3 className="text-xl font-bold text-[#008080] font-dancing">
                        {letter}
                      </h3>
                    </div>

                    {/* Patients under this alphabet */}
                    <div className="space-y-3">
                      {groupedPatients[letter].map((patient, i) => (
                        <Sheet key={patient.patient_id}>
                          <SheetTrigger asChild>
                            <div
                              onClick={() => {
                                setSelectedPatient(patient);
                                setEditedName(patient.name || "");
                                setEditedDOB(new Date(patient.dob));
                                setEditedGender(patient.gender || "");
                              }}
                              className="bg-[#008080] text-white p-4 rounded-md hover:drop-shadow-2xl transition hover:cursor-pointer"
                            >
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                <h3 className="font-medium truncate max-w-xs">
                                  {patient.name || "Unnamed Patient"}
                                </h3>

                                <p className="text-sm text-white italic truncate max-w-xs">
                                  CNIC: {patient.cnic}
                                </p>

                                <p className="text-sm text-white italic truncate max-w-xs">
                                  Add Date: {new Date(patient.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <p className="mt-2 text-sm text-gray-100">
                                DOB: {new Date(patient.dob).toLocaleDateString()}
                              </p>
                            </div>
                          </SheetTrigger>

                          {/* Sheet stays EXACTLY the same */}
                          <SheetContent>
                            <SheetHeader>
                              <SheetTitle>Edit Patient</SheetTitle>
                              <SheetDescription>
                                Update your patient information. Save to apply changes or
                                delete permanently.
                              </SheetDescription>
                            </SheetHeader>

                            <div className="grid flex-1 auto-rows-min gap-6 px-4 mt-4">
                              <div className="grid gap-3">
                                <Label>Name</Label>
                                <Input
                                  value={editedName}
                                  onChange={(e) => setEditedName(e.target.value)}
                                />
                              </div>

                              <div className="grid gap-3">
                                <Label>Date of Birth</Label>
                                  <Popover open={open} onOpenChange={setOpen}>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="outline"
                                        id="date"
                                        className="justify-start font-normal"
                                      >
                                        {editedDOB.toLocaleDateString()}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                      <Calendar
                                        mode="single"
                                        selected={editedDOB}
                                        defaultMonth={editedDOB}
                                        captionLayout="dropdown"
                                        onSelect={(date) => {
                                          if (date){
                                            setEditedDOB(date);
                                            setOpen(false);
                                          }
                                        }}
                                      />
                                    </PopoverContent>
                                  </Popover>
                              </div>

                              <div className="grid gap-3">
                                <Label>Gender</Label>
                                <Select
                                  value={editedGender}
                                  onValueChange={setEditedGender}
                                >
                                  <SelectTrigger className="w-full max-w-48">
                                    <SelectValue placeholder="Select gender" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectGroup>
                                      <SelectLabel>Gender</SelectLabel>
                                      <SelectItem value="female">Female</SelectItem>
                                      <SelectItem value="male">Male</SelectItem>
                                    </SelectGroup>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <SheetFooter className="flex gap-2">
                              <SheetClose asChild>
                                <Button
                                  variant="destructive"
                                  onClick={() =>
                                    selectedPatient &&
                                    deletePitch(selectedPatient.patient_id)
                                  }
                                  className="flex-1"
                                >
                                  Delete
                                </Button>
                              </SheetClose>

                              <SheetClose asChild>
                                <Button
                                  className="flex-1 bg-[#008080]"
                                  onClick={() =>
                                    selectedPatient &&
                                    editPitch(
                                      selectedPatient.patient_id,
                                      editedName,
                                      editedDOB,
                                      editedGender
                                    )
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
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
