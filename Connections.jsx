import { Users, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useDispatch, useSelector } from "react-redux";
import api from "../api/axios";
import toast from "react-hot-toast";
import { fetchConnections } from "../features/connections/connectionsSlice";

const Connections = () => {
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState("Followers");
  const { getToken } = useAuth();
  const dispatch = useDispatch();

  const { connections, pendingConnections, followers, following } =
    useSelector((state) => state.connections);

  const dataArray = [
    { label: "Followers", value: followers, icon: Users },
    { label: "Following", value: following, icon: Users },
    { label: "Pending", value: pendingConnections, icon: Users },
    { label: "Connections", value: connections, icon: Users },
  ];

  const handleUnfollow = async (userId) => {
    try {
      const { data } = await api.post(
        "/api/user/unfollow",
        { id: userId },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );

      if (data.success) {
        toast.success(data.message);
      } else {
        toast(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const acceptConnections = async (userId) => {
    try {
      const { data } = await api.post(
        "/api/user/accept",
        { id: userId },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );

      if (data.success) {
        toast.success(data.message);
        dispatch(fetchConnections(await getToken()));
      } else {
        toast(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    getToken().then((token) => {
      dispatch(fetchConnections(token));
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto p-6">

        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[#172357]">
Connections
</h1>

          <p className="text-slate-500 mt-1">
            Manage your network and discover new friends
          </p>
        </div>

        {/* STATS */}
        <div className="mb-8 flex flex-wrap gap-6">
          {dataArray.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center gap-1 
              h-20 w-40 rounded-2xl 
              bg-white
              shadow-sm
              border border-slate-200
              hover:shadow-lg
              transition"
            >
              <b className="text-[#172357] text-lg">
                {item.value.length}
              </b>
              <p className="text-slate-600 text-sm">{item.label}</p>
            </div>
          ))}
        </div>

        {/*TABS */}
        <div className="inline-flex flex-wrap items-center 
        rounded-xl p-1 bg-white
        shadow-sm
        border border-slate-200">

          {dataArray.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setCurrentTab(tab.label)}
              className={`flex items-center px-4 py-2 text-sm rounded-lg transition 
              ${
                currentTab === tab.label
                  ? "bg-[#172357] text-white shadow"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="ml-1">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* USERS */}
        <div className="flex flex-wrap gap-6 mt-6">
          {dataArray
            .find((item) => item.label === currentTab)
            .value.map((user) => (
              <div
                key={user._id}
                className="w-full max-w-88 flex gap-5 p-6 
                bg-white
                rounded-2xl
                shadow-sm
                hover:shadow-lg
                border border-slate-200 
                hover:-translate-y-1"
              >
                <img
                  src={user.profile_picture}
                  className="rounded-full w-12 h-12 border-2 border-[#172357]"
                />

                <div className="flex-1">
                  <p className="font-semibold text-[#172357]">
                    {user.full_name}
                  </p>

                  <p className="text-slate-500 text-sm">
                    @{user.username}
                  </p>

                  <p className="text-sm text-slate-600">
                    {user.bio?.slice(0, 30)}...
                  </p>

                  <div className="flex max-sm:flex-col gap-2 mt-4">

                    {/* PROFILE */}
                    <button
                      onClick={() => navigate(`/profile/${user._id}`)}
                      className="w-full p-2 text-sm rounded-lg 
                      bg-[#172357]
                      hover:bg-[#20398a] 
                      text-white transition"
                    >
                      View Profile
                    </button>

                    {/* UNFOLLOW */}
                    {currentTab === "Following" && (
                      <button
                        onClick={() => handleUnfollow(user._id)}
                        className="w-full p-2 text-sm rounded-lg 
                        bg-slate-100
                        hover:bg-slate-200
                        text-[#172357] transition"
                      >
                        Unfollow
                      </button>
                    )}

                    {/* ACCEPT */}
                    {currentTab === "Pending" && (
                      <button
                        onClick={() => acceptConnections(user._id)}
                        className="w-full p-2 text-sm rounded-lg 
                        bg-green-100
                        hover:bg-green-200
                        text-green-700 transition"
                      >
                        Accept
                      </button>
                    )}

                    {/* MESSAGE */}
                    {currentTab === "Connections" && (
                      <button
                        onClick={() =>
                          navigate(`/messages/${user._id}`)
                        }
                        className="w-full p-2 text-sm rounded-lg 
                        bg-[#172357]
                        hover:bg-[#20398a]
                        text-white 
                        flex items-center justify-center gap-1 transition"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Message
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Connections;