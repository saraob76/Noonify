import { useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import spuLogo from "../assets/spu-logo.png";

const Verification = () => {

  const [role, setRole] = useState("");
  const [studentId, setStudentId] = useState("");
  const [professorName, setProfessorName] = useState("");

  const navigate = useNavigate();
  const { getToken } = useAuth();

  const submitVerification = async () => {
    try {

      const token = await getToken();

      const faculty = localStorage.getItem("faculty");

      await axios.post(
        `${import.meta.env.VITE_BASEURL}/api/user/verification-request`,
        {
          userType: role,
          studentId,
          professorName,
          faculty,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Verification request submitted");

      navigate("/pending-approval");

    } catch (error) {

      toast.error(
        error.response?.data?.message || "Verification failed"
      );

    }
  };
  return (

  <div className="min-h-screen bg-[#172357] relative overflow-hidden">

    {/* Background */}

    <div className="absolute inset-0">

      <div className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-[#BF222F]/20 blur-[170px]" />

      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-white/5 blur-[180px]" />

    </div>

    {/* Main */}

    <div className="relative z-10 flex items-center justify-center min-h-screen px-8 py-10">

      <div
        className="
          w-full
          max-w-[1200px]
          rounded-[40px]
          bg-white
          border-t-4
          border-[#BF222F]
          shadow-[0_40px_120px_rgba(0,0,0,.35)]
          p-14
        "
      >

        {/* Header */}

        <div className="flex flex-col items-center">

  <img
    src={spuLogo}
    alt="SPU"
    className="w-[340px] object-contain mb-8"
  />

  <h1 className="text-[52px] font-black text-[#172357]">
    Account Verification
  </h1>

  <p className="mt-4 text-lg text-slate-500">
    Verify your university identity before entering UniSphere
  </p>

</div>

        {/* Role Selection */}

        {!role && (

          <div className="grid md:grid-cols-2 gap-10 mt-14">{/* ========================= STUDENT ========================= */}

<button
  onClick={() => setRole("student")}
  className="
    group
    rounded-[34px]
    border
    border-slate-200
    bg-white
    p-10
    shadow-[0_25px_60px_rgba(23,35,87,.12)]
    transition-all
    duration-500
    hover:-translate-y-2
    hover:border-[#BF222F]
    hover:shadow-[0_35px_80px_rgba(23,35,87,.20)]
  "
>

  <div className="flex justify-center">

    <div
      className="
        flex
        h-24
        w-24
        items-center
        justify-center
        rounded-full
        bg-[#172357]
        text-5xl
        text-white
        shadow-lg
      "
    >
      🎓
    </div>

  </div>

  <h2 className="mt-8 text-center text-4xl font-black text-[#172357]">
    Student
  </h2>

  <p className="mt-3 text-center text-lg text-slate-600">
    Verify using your university ID number
  </p>

  <div className="mt-10 flex justify-center">

    <span
      className="
        rounded-full
        bg-[#172357]
        px-8
        py-3
        font-bold
        text-white
        transition-all
        duration-300
        group-hover:bg-[#BF222F]
      "
    >
      Continue →
    </span>

  </div>

</button>

{/* ========================= PROFESSOR ========================= */}

<button
  onClick={() => setRole("professor")}
  className="
    group
    rounded-[34px]
    border
    border-slate-200
    bg-white
    p-10
    shadow-[0_25px_60px_rgba(23,35,87,.12)]
    transition-all
    duration-500
    hover:-translate-y-2
    hover:border-[#BF222F]
    hover:shadow-[0_35px_80px_rgba(23,35,87,.20)]
  "
>

  <div className="flex justify-center">

    <div
      className="
        flex
        h-24
        w-24
        items-center
        justify-center
        rounded-full
        bg-[#BF222F]
        text-5xl
        text-white
        shadow-lg
      "
    >
      👨‍🏫
    </div>

  </div>

  <h2 className="mt-8 text-center text-4xl font-black text-[#172357]">
    Professor
  </h2>

  <p className="mt-3 text-center text-lg text-slate-600">
    Verify using your full name
  </p>

  <div className="mt-10 flex justify-center">

    <span
      className="
        rounded-full
        bg-[#172357]
        px-8
        py-3
        font-bold
        text-white
        transition-all
        duration-300
        group-hover:bg-[#BF222F]
      "
    >
      Continue →
    </span>

  </div>

</button>

</div>

)}{/* ========================= STUDENT FORM ========================= */}
{role === "student" && (

<div className="mt-14 flex justify-center">

  <div
    className="
      w-full
      max-w-xl
      rounded-[34px]
      border
      border-slate-200
      bg-white
      p-10
      shadow-[0_25px_60px_rgba(23,35,87,.12)]
    "
  >

    <h2 className="text-center text-3xl font-black text-[#172357]">
      Student Verification
    </h2>

    <p className="mt-3 text-center text-slate-500">
      Enter your University ID
    </p>

    <input
      type="text"
      value={studentId}
      onChange={(e) => setStudentId(e.target.value)}
      placeholder="University ID"
      className="
        mt-8
        w-full
        rounded-2xl
        border
        border-slate-300
        px-5
        py-4
        text-lg
        outline-none
        transition
        focus:border-[#BF222F]
      "
    />

    <button
      onClick={submitVerification}
      className="
        mt-8
        w-full
        rounded-2xl
        bg-[#172357]
        py-4
        font-bold
        text-white
        transition
        hover:bg-[#BF222F]
      "
    >
      Submit Verification
    </button>

    <button
      onClick={() => setRole("")}
      className="
        mt-4
        w-full
        rounded-2xl
        border
        border-[#172357]
        py-4
        font-semibold
        text-[#172357]
        transition
        hover:bg-[#172357]
        hover:text-white
      "
    >
      ← Back
    </button>

  </div>

</div>

)}
{/* ========================= PROFESSOR FORM ========================= */}
{role === "professor" && (

<div className="mt-14 flex justify-center">

  <div
    className="
      w-full
      max-w-xl
      rounded-[34px]
      border
      border-slate-200
      bg-white
      p-10
      shadow-[0_25px_60px_rgba(23,35,87,.12)]
    "
  >

    <h2 className="text-center text-3xl font-black text-[#172357]">
      Professor Verification
    </h2>

    <p className="mt-3 text-center text-slate-500">
      Enter your Full Name
    </p>

    <input
      type="text"
      value={professorName}
      onChange={(e) => setProfessorName(e.target.value)}
      placeholder="Professor Full Name"
      className="
        mt-8
        w-full
        rounded-2xl
        border
        border-slate-300
        px-5
        py-4
        text-lg
        outline-none
        transition
        focus:border-[#BF222F]
      "
    />

    <button
      onClick={submitVerification}
      className="
        mt-8
        w-full
        rounded-2xl
        bg-[#172357]
        py-4
        font-bold
        text-white
        transition
        hover:bg-[#BF222F]
      "
    >
      Submit Verification
    </button>

    <button
      onClick={() => setRole("")}
      className="
        mt-4
        w-full
        rounded-2xl
        border
        border-[#172357]
        py-4
        font-semibold
        text-[#172357]
        transition
        hover:bg-[#172357]
        hover:text-white
      "
    >
      ← Back
    </button>

  </div>

</div>

)}
      </div>

    </div>

  </div>

);

};

export default Verification;