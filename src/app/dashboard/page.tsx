"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/protectedRoute";
import { getUserPatientsWithEmail } from "@/lib/patient-db";
import { motion } from "framer-motion";
import { Plus } from "lucide-react"
import { toast } from "sonner";
import { useStatusToast } from "@/lib/useStatusToast";

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
  const [loading,setLoading]=useState(false)
  const [statusData, setStatusData] = useState({status: "", message: ""});
  useStatusToast(statusData);

  useEffect(() => {
    getData();
  }, []);

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
      setStatusData({ status: "danger", message: "Failed to get Data" });
    }
    finally{
      setLoading(false);
    }
  };

  //redirect to generate page
  const handleNewPatient = () => {
    router.push("/addPatient");
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
                        <div
                            key={patient.patient_id}
                            onClick={() => router.push(`/patient/${patient.patient_id}`)}
                            className="bg-[#008080] text-white p-4 rounded-md hover:drop-shadow-2xl transition hover:cursor-pointer"
                          >
                           <div className="grid grid-cols-[1fr_180px_180px] items-center">
                              <h3 className="font-medium truncate">
                                {patient.name}
                              </h3>

                              <p className="text-sm text-white italic truncate">
                                CNIC: {patient.cnic}
                              </p>

                              <p className="text-sm text-white italic truncate">
                                DOB: {new Date(patient.dob).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
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
