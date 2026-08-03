import { useNavigate } from "react-router-dom";

import medicineLogo from "../assets/logo-Medicine.png";
import dentistryLogo from "../assets/logo-Denistry.png";
import pharmacyLogo from "../assets/logo-pharma.png";
import aiLogo from "../assets/logo-Engineering.png";
import biomedicalLogo from "../assets/logo-Engineering.png";
import petroleumLogo from "../assets/logo-Petroleum.png";
import businessLogo from "../assets/logo-Business_Asminstation.png";

const faculties = [
  {
    id: "human-medicine",
    logo: medicineLogo,
    circleColor: "#610a7e",
  },
  {
    id: "dentistry",
    logo: dentistryLogo,
    circleColor: "#1f6d27",
  },
  {
    id: "pharmacy",
    logo: pharmacyLogo,
    circleColor: "#e68e0a",
  },
  {
    id: "ai-engineering",
    logo: aiLogo,
    circleColor: "#ab1111",
  },
    {
    id: "business",
    logo: businessLogo,
    circleColor: "#5cb1f7",
  },
    {
    id: "petroleum-engineering",

    logo: petroleumLogo,
    circleColor: "#073153",
  },



];

const FacultySelection = () => {
  const navigate = useNavigate();

  const handleSelect = (faculty) => {
    localStorage.setItem("faculty", faculty.id);
    localStorage.setItem("facultyName", faculty.name);

    navigate("/verification");
  };

  return (
    <div className="min-h-screen bg-[#172357] overflow-hidden relative">

      {/* Background Glow */}

      <div className="absolute inset-0">

        <div className="absolute -top-44 -left-44 w-[550px] h-[550px] rounded-full bg-[#BF222F]/15 blur-[170px]" />

        <div className="absolute bottom-0 right-0 w-[650px] h-[650px] rounded-full bg-white/5 blur-[180px]" />

      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-8 py-10">

        <div
          className="
            w-full
            max-w-[1650px]
            rounded-[38px]
            bg-white
            border-t-4
            border-[#BF222F]
            shadow-[0_35px_100px_rgba(0,0,0,.30)]
            p-14
          "
        >

          {/* Header */}

         <div className="flex flex-col items-center text-center">

  <img
    src="/src/assets/spu-logo.png"
    alt="SPU"
    className="
      w-[360px]
      object-contain
      mb-8
      transition-all
      duration-500
      hover:scale-105
    "
  />

  <h1 className="text-[56px] font-black text-[#172357] leading-none">
    Choose Your College
  </h1>

  <p className="mt-4 text-xl text-slate-500">
    Please select your faculty to continue
  </p>

</div>
          {/* Faculties Grid */}

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-9">
            {faculties.map((faculty, index) => (
  <button
    key={faculty.id}
    onClick={() => handleSelect(faculty)}
    style={{
      animationDelay: `${index * 120}ms`,
    }}
   className="
  group
  relative
  overflow-hidden
  rounded-[32px]
  p-10
  shadow-lg
  transition-all
  duration-500
  hover:-translate-y-3
  hover:shadow-2xl
"
style={{
  backgroundColor: faculty.circleColor,
}}
  >
    {/* Red Line */}

    <div
      className="
        absolute
        top-0
        left-0
        h-1
        w-0
        bg-[#BF222F]
        transition-all
        duration-500
        group-hover:w-full
      "
    />

    {/* Logo */}

    <div className="flex justify-center">
  <img
    src={faculty.logo}
    alt={faculty.name}
    className="h-36 object-contain drop-shadow-xl"
    draggable={false}
  />
</div>

    {/* Arabic Name */}

    <h2
      className="
        mt-8
        text-center
        text-[31px]
        font-black
        text-[#172357]
      "
    >
      {faculty.name}
    </h2>

    {/* English */}

    <p
      className="
        mt-2
        text-center
        text-[18px]
        font-semibold
        text-[#BF222F]
      "
    >
      {faculty.english}
    </p>

    {/* Description */}

    <p
      className="
        mt-5
        text-center
        leading-8
        text-[15px]
        text-slate-600
      "
    >
      {faculty.subtitle}
    </p>

    {/* Bottom */}

    <div
      className="
        mt-8
        flex
        items-center
        justify-center
      "
    >

      <span
        className="
          rounded-full
          bg-[#172357]
          px-8
          py-3
          text-sm
          font-bold
          tracking-wider
          text-white
          transition-all
          duration-300
          group-hover:bg-[#BF222F]
        "
      >
        
      </span>

    </div>

  </button>
))}
          </div>

          {/* Footer */}

          <div className="mt-16 border-t border-slate-200 pt-8">

            <p className="text-center text-sm tracking-[0.25em] text-slate-500 uppercase">
              Syrian Private University
            </p>

            <p className="mt-3 text-center text-lg font-semibold text-[#172357]">
              UniSphere Academic Community Platform
            </p>

          </div>

        </div>

      </div>

    </div>
  );
};

export default FacultySelection;