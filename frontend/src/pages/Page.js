import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import formatDistantToNow from "date-fns/formatDistanceToNow";

const PersonalPage = () => {
  const { user } = useAuthContext();
  const [pageOwner, setPageOwner] = useState(null);
  const { id } = useParams();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState(null);
  const [blogs, setBlogs] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      setIsPending(true);
      try {
        const response = await fetch(`http://localhost:4000/api/users/${id}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setPageOwner(data);
          console.log(data);
        } else {
          setError(data.error);
          console.log(data);
        }
      } catch (error) {
        setError(error.message);
      }
      setIsPending(false);
    };

    if (user) getUser();
  }, [id, user]);

  useEffect(() => {
    const getBlogs = async () => {
      setIsPending(true);
      try {
        const response = await fetch(
          `http://localhost:4000/api/personalBlogs/${id}`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          },
        );
        const data = await response.json();
        if (response.ok) {
          setBlogs(data);
          console.log("blogs", data);
        } else {
          setError(data.error);
        }
      } catch (error) {
        setError(error.message);
      }
      setIsPending(false);
    };

    if (user) getBlogs();
  }, [id, user]);

  return (
    <div>
      {isPending && <p>Loading...</p>}
      {error && <div className="error">{error}</div>}
      {pageOwner && (
        <div>
          <h1>Personal Page</h1>
          <div className="user-information">
            <h2>user information</h2>
            <p>username: {pageOwner.username}</p>
            <p>email: {pageOwner.email}</p>
          </div>
          <div>
            {error && <div className="error">{error}</div>}
            {isPending && <p>Loading...</p>}
            <h2>blogs</h2>
            <div>
              {blogs &&
                blogs.map((blog) => (
                  <div key={blog._id}>
                    <Link to={`/blogs/${blog._id}`}>
                      <h2>{blog.title}</h2>
                      <p className="created-at">
                        {formatDistantToNow(new Date(blog.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </Link>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalPage;
