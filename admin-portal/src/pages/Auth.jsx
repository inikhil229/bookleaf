import { FaArrowRight, FaBookOpen, FaWandMagicSparkles } from "react-icons/fa6";
import { Brand, Button, Field } from "../components/UI.jsx";
import { useState } from "react";

export default function Auth() {  

  const [email, setemail] = useState("")
  
  const validateLogin = () => {
    if (!email) {
      toast.error("Email is Required");
      return false;
    }
    if (!password) {
      toast.error("Password is Required");
      return true;
    }
    return true;
  };



  
  const handleLogin = async (e) => {
      if (validateLogin()) {
        try {
          
        } catch (error) {
          
        }
      }
    console.log("handle login clicked");
  };

  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-[1fr_1fr]">
      {/* Left Branding Section */}
      <section className="relative hidden overflow-hidden bg-[#151d42] p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="absolute -bottom-20 -left-24 h-80 w-80 rounded-full bg-sky-400/20 blur-3xl" />

        <Brand />

        <div className="relative max-w-lg">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-indigo-100">
            <FaWandMagicSparkles />
            Your publishing journey, in one place
          </div>

          <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight xl:text-6xl">
            Your words.
            <br />
            <span className="text-indigo-300">Your world.</span>
          </h1>

          <p className="mt-6 max-w-md text-base leading-7 text-indigo-100/75">
            A clearer view of your books, royalties and conversations with the
            BookLeaf team.
          </p>

          <div className="mt-10 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/10">
              <FaBookOpen size={22} />
            </div>

            <div>
              <p className="text-sm font-bold">Every book, every update</p>
              <p className="mt-1 text-xs text-indigo-100/60">
                Publishing support that keeps you in the loop.
              </p>
            </div>
          </div>
        </div>

        <p className="relative text-xs text-indigo-100/50">
          © {new Date().getFullYear()} BookLeaf Publishing
        </p>
      </section>

      {/* Right Login Form */}
      <section className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden">
            <Brand />
          </div>

          <p className="mb-3 text-xs font-bold uppercase tracking-[.16em] text-indigo-600">
            Welcome back
          </p>

          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Admin sign in
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Continue with your administrator email address.
          </p>

          <div className="mt-8 space-y-5">
            <input
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
              className="px-5 py-2.5 w-full outline-none border border-gray-300 rounded-full"
            />

            <Button
              onClickFunc={()=>{
                if(validateLogin()){
                  handleLogin()
                }
              }}
              type="button"
              className="mt-2 w-full py-3"
            >
              Continue with email
              <FaArrowRight />
            </Button>
          </div>

          <p className="mt-7 text-center text-sm text-slate-500">
            Admin accounts are provisioned by your system administrator.
          </p>

          <p className="mt-10 text-center text-xs leading-5 text-slate-400">
            Sample mode: email-only sign-in. Password authentication is not
            enabled.
          </p>
        </div>
      </section>
    </div>
  );
}
