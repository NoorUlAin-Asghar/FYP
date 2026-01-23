"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams  } from "next/navigation";
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

import { getPatientById, updatePatientToDb, deletePatientFromDb } from "@/lib/patient-db";
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


export default function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient>();
  const router = useRouter();
  
  const [editedName, setEditedName] = useState("");
  const [editedDOB, setEditedDOB] = useState<Date>(new Date());
  const [editedGender, setEditedGender] = useState("");
  const [loading,setLoading]=useState(true)
  const [message, setMessage]= useState<string | null>(null);
  const [status,setStatus]=useState<string | null>(null);
  const [open, setOpen] = useState(false)

  useEffect(() => {
        if (!id) return;
    fetchPatient();
  }, []);

  //show required toast message (successful or unsuccessful deletion/editing of pitch)
  useEffect(() => {
    if (status==="success")
      toast.success(message)
    else if(status==="danger")
      toast.error(message)

  }, [message,status]);

    //fetching data from db
    const fetchPatient  = async () => {
    try {
        setLoading(true)
        const data = await getPatientById(id);
        console.log(data)

        const normalizedPatient: Patient = {
        patient_id: String(data.patient_id),
        name: data.name,
        gender: data.gender,
        cnic: String(data.cnic),
        dob: new Date(data.dob),
        created_at: new Date(data.created_at),
        };

        setPatient(normalizedPatient);
      
    } catch (error) {
        console.error("Failed to get Data");
    }
    finally{
        setLoading(false);
    }
  };

  //redirect to generate page
  const handleNewScan = () => {
    router.push("/addScan");
  };
  
  const editPatient = async (id: string, newName: string, newDOB: Date, newGender: string) => {
    try{
      setLoading(true);
      console.log("Saving")
      // console.log("Saving", id, newTitle, newBody);
      const res=await updatePatientToDb(id,newName,newDOB, newGender)
      setMessage(res.message);
      setStatus(res.status)
      await fetchPatient();
    }
    finally{
      setLoading(false)
    }
  };

  const deletePatient = async (id: string) => {
    try{
      setLoading(true)
      console.log("Deleting")
      // console.log("Deleting", id);
      const res=await deletePatientFromDb(id)
      setMessage(res.message);
      setStatus(res.status)
      await fetchPatient();
      
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

if (patient){
  return (
    <ProtectedRoute>
      <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-5xl font-bold mb-2 text-black font-dancing">Patient Profile</h1>
              <p className="text-gray-600">CNIC: <span className="font-medium text-[#008080]">{patient.cnic}</span></p>
            </div>
            <button
              onClick={handleNewScan}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-[#008080] text-white rounded-2xl shadow-md hover:bg-teal-800 transition-all duration-300 ease-in-out font-semibold text-base tracking-wide hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Add New Scan
            </button>
          </div>

          {/* <div className="flex justify-between items-center mt-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Total Scans</h2>
              <p className="text-2xl font-bold text-[#008080]">{count}</p>
            </div>
          </div> */}

        </div>
      </div>
    </ProtectedRoute>
  );
}
}
