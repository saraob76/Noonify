import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import UserCard from "../components/UserCard";
import Loading from "../components/Loading";
import { useAuth } from "@clerk/clerk-react";
import { useDispatch } from "react-redux";
import api from "../api/axios";
import toast from "react-hot-toast";
import { fetchUser } from "../features/user/userSlice";

const Discover = () => {
  const [input, setInput] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const { getToken } = useAuth();
  const dispatch = useDispatch();

  const handleSearch = async (e) => {
    if (e.key === "Enter") {
      try {
        setUsers([]);
        setLoading(true);

        const { data } = await api.post(
          "/api/user/discover",
          { input },
          {
            headers: {
              Authorization: `Bearer ${await getToken()}`,
            },
          }
        );

        data.success
          ? setUsers(data.users)
          : toast.error(data.message);

        setInput("");
      } catch (error) {
        toast.error(error.message);
      }

      setLoading(false);
    }
  };

  useEffect(() => {
    getToken().then((token) => {
      dispatch(fetchUser(token));
    });
  }, [dispatch, getToken]);

  return (
    <div className="min-h-screen bg-slate-50">

      <div className="max-w-6xl mx-auto p-6">

        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[#172357]">
           Discover People
          </h1>

          <p className="text-slate-500 mt-1">
           Discover students and professors across the university.
            </p>
        </div>

        {/* SEARCH BOX */}
        <div className="mb-10
            bg-white
            rounded-2xl
            shadow-sm
            border border-slate-200">

          <div className="p-6">
            <div className="relative">

              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2
                  text-slate-400 w-5 h-5"
              />

              <input
                type="text"
                placeholder="Search by name, username, bio, or location..."
                className="pl-12 py-3 w-full
                 rounded-xl
                 border border-slate-300
                 bg-white
                 focus:outline-none
                 focus:ring-2
                 focus:ring-[#172357]/20
                 focus:border-[#172357]
                 placeholder:text-slate-400
                 text-slate-700
                 transition"
                onChange={(e) => setInput(e.target.value)}
                value={input}
                onKeyUp={handleSearch}
              />
            </div>
          </div>
        </div>

        {/* 👩‍💻 USERS */}
        <div className="flex flex-wrap gap-8">
          {users.map((user) => (
            <UserCard user={user} key={user._id} />
          ))}
        </div>

        {/* ⏳ LOADING */}
        {loading && <Loading height="60vh" />}
      </div>
    </div>
  );
};

export default Discover;