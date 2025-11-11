// lib/db/pitch.ts

import supabase from "./supabaseClient";

export async function savePitchToDB({
    title,
    body,
    user_id,
    }: {
    title: string;
    body: string;
    user_id: string;
    }) {
    // console.log(title,"\n",body,"\n",user_id)
    // console.log(user_id)

    const { error } = await supabase.from("pitches").insert([
        {
        user_id,
        title,
        body,
        },
    ]);

    if (error) {
        console.error("Error saving pitch"/*, error.message*/);
        return {"message":"Unable to save pitch"};
    }
    else{
        console.log("pitch successfully added to DB")
        return {"message":"Pitch saved successfully."};
    }
}


export async function getUserPitchesWithEmail() {
  // Get the currently logged-in user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("User fetch error"/*, userError?.message*/);
    return { email: null, pitches: [], count: 0 };
  }

  // Fetch the user's pitches
  const { data: pitches, error } = await supabase
    .from("pitches")
    .select("id, title, body, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching pitches" /*error.message*/);
    return { email: user.email, pitches: [], count: 0 };
  }
  else{
    console.log("Fetched data successfully" /*user.email, pitches, pitches.length*/)
  }

  return {
    email: user.email,
    pitches,
    count: pitches.length,
  };
}

export async function saveChangesToDb(pitchId:string, newTitle:string, newBody:string) {
    const { data, error } = await supabase
        .from("pitches")
        .update({ title: newTitle, body: newBody, updated_at: new Date().toISOString() })
        .eq("id", pitchId);

    if (error) {
        console.error("Error updating pitch"/*, error.message*/);
        //alert("Failed to save changes.");
        return {"status":"danger","message":"Failed to save changes"};;
    }

    console.log("Pitch updated"/*, data*/);
    return {"status":"success","message":"Changes saved successfully."};
}

export async function deletePitchFromDb(pitchId:string) {
  const { error } = await supabase
    .from("pitches")
    .delete()
    .eq("id", pitchId);

  if (error) {
    console.error("Error deleting pitch", /*error.message*/);
    //alert("Failed to delete pitch.");
    return {"status":"danger","message":"Failed to delete pitch."};
  }

  //alert("Pitch deleted successfully!");
  return {"status":"success","message":"Pitch deleted successfully"};
}
