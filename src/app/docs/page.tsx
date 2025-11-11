import Link from "next/link";

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-[#008080] to-[#00f5f5] text-black px-6 py-10 md:px-20 ">
      <div className="bg-gradient-to-br from-white to-gray-100 p-20 m-20 rounded-lg shadow-xl">
        <h1 className="text-4xl font-bold font-dancing text-[#008080] mb-6 text-center">Pitch Writer – Documentation</h1>
        <hr className="pb-3 border-black"></hr>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold font-dancing text-[#008080] mb-2">About This Web App</h2>
          <p className="text-base leading-7">
            Pitch Writer is a powerful tool that allows you to <strong>create</strong>, <strong>edit</strong>, and <strong>delete</strong> personalized pitches. You can customize your pitch by selecting a preferred tone and pitch type. Ideal for job applications, cold emails, and personal introductions.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold font-dancing text-[#008080] mb-2">API Used</h2>
          <p className="text-base leading-7">
            We utilize the <Link href="https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct" className="text-[#008080] underline">Meta-Llama-3-8B-Instruct</Link> model hosted on Hugging Face. This model is used to generate natural, personalized pitch content based on user inputs.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold font-dancing text-[#008080] mb-2">How It Works</h2>
   
            <ol className="list-decimal list-inside">
              <li>Enter your role, goals, and tone preferences.</li>
              <li>The app sends this information to the Hugging Face API.</li>
              <li>The model returns a personalized pitch.</li>
              <li>You can review, edit, save, or delete the pitch.</li>
            </ol>
  
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold font-dancing text-[#008080] mb-2">Privacy & Data Usage</h2>
          <p className="text-base leading-7">
            All pitches are stored securely in Supabase and are only accessible by the logged-in user. We do not share your data with any third-party services.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold font-dancing text-[#008080] mb-2">Tech Stack</h2>
          <p className="text-base leading-7">
            This app is built using <strong>Next.js</strong>, <strong>Tailwind CSS</strong> for styling, <strong>Framer Motion</strong> for animations, <strong>Supabase</strong> for authentication and database, and <strong>Hugging Face API</strong> for pitch generation.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold font-dancing text-[#008080] mb-2">FAQs</h2>
          <ul className="list-disc list-inside text-base leading-7">
            <li><strong>Can I use this app for free?</strong> Yes, it is currently free to use.</li>
            <li><strong>How do I customize the tone of my pitch?</strong> Simply choose your desired tone before generating the pitch.</li>
            <li><strong>Where are my pitches stored?</strong> They are stored in your personal Supabase account space, accessible only to you.</li>
          </ul>
        </section>

        <section className="mb-20">
          <h2 className="text-2xl font-semibold text-[#008080] font-dancing mb-2">Other Products</h2>
          <ul className="list-disc list-inside text-base leading-7">
            <li>
              <Link href="https://blog-summarizer-delta.vercel.app/" className="text-[#008080] underline">
                Blog Summarizer
              </Link> – Extracts and translates blog summaries in simple English and Urdu.
            </li>
            <li>
              <Link href="https://quote-generator-nine-delta.vercel.app/" className="text-[#008080] underline">
                Quote Generator
              </Link> – Generate meaningful quotes for inspiration and sharing.
            </li>
          </ul>
        </section>

        <footer className="border-t pt-6 text-sm text-center text-gray-500">
          <p>© 2025 Pitch Writer. All rights reserved.</p>
          <p>
            <Link href="https://github.com/NoorUlAin-Asghar/Nexium_NoorUlAinAsghar" className="text-[#008080] underline">
              View on GitHub
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
}
