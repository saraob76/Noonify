import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios";
import toast from "react-hot-toast";
import moment from "moment";

const AdminReports = () => {
  const { getToken } = useAuth();

  const [posts, setPosts] = useState([]);

  const fetchReports = async () => {
    try {
      const token = await getToken();

      const { data } = await api.get("/api/post/reports", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data.success) {
        setPosts(data.posts);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const deletePost = async (postId) => {
    try {
      const token = await getToken();

      const { data } = await api.post(
        "/api/post/reports/delete",
        { postId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        toast.success(data.message);
        fetchReports();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const ignoreReport = async (postId) => {
    try {
      const token = await getToken();

      const { data } = await api.post(
        "/api/post/reports/ignore",
        { postId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        toast.success(data.message);
        fetchReports();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8">

      <h1 className="text-3xl font-bold text-[#172357] mb-8">
        Reported Posts
      </h1>

      <div className="space-y-6">

        {posts.map((post) => (

          <div
  key={post._id}
  className="
    bg-white
    rounded-3xl
    border
    border-slate-200
    shadow-lg
    hover:shadow-xl
    transition
    p-6
  "
>

            <div className="flex justify-between items-start gap-6">

  <div className="flex gap-5 flex-1">

    <img
      src={post.user.profile_picture}
      alt={post.user.full_name}
      className="
        w-16
        h-16
        rounded-full
        object-cover
        border-2
        border-[#172357]
      "
    />

    <div className="flex-1">

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-xl font-bold text-[#172357]">
            {post.user.full_name}
          </h2>

          <p className="text-slate-500">
            @{post.user.username}
          </p>

        </div>

        <span className="text-sm text-slate-400">
          {moment(post.createdAt).fromNow()}
        </span>

      </div>

      <p className="mt-5 text-slate-700 whitespace-pre-wrap">
        {post.content}
      </p>

      {post.image_urls?.length > 0 && (
        <img
          src={post.image_urls[0]}
          className="
            mt-5
            rounded-2xl
            w-full
            max-h-96
            object-cover
          "
        />
      )}

      <div className="mt-5">

        <span className="
          inline-block
          px-3
          py-1
          rounded-full
          bg-red-100
          text-red-600
          font-semibold
        ">
          {post.reports.length} Reports
        </span>

      </div>

      <div className="mt-5">

        <h4 className="font-semibold text-[#172357]">
          Reported By
        </h4>

        <div className="flex flex-wrap gap-2 mt-2">

          {post.reports.map((r) => (
            <span
              key={r._id}
              className="
                px-3
                py-1
                rounded-full
                bg-slate-100
                text-sm
              "
            >
              {r.user?.full_name}
            </span>
          ))}

        </div>

      </div>

    </div>

  </div>

  <div className="flex flex-col gap-3">

    <button
      onClick={() => ignoreReport(post._id)}
      className="
        bg-slate-200
        hover:bg-slate-300
        px-5
        py-2
        rounded-xl
        font-medium
      "
    >
      Ignore
    </button>

    <button
      onClick={() => deletePost(post._id)}
      className="
        bg-red-600
        hover:bg-red-700
        text-white
        px-5
        py-2
        rounded-xl
        font-medium
      "
    >
      Delete
    </button>

  </div>

</div>

          </div>

        ))}

      </div>

    </div>
  );
};

export default AdminReports;