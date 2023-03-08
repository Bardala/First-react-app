import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import CreateComment from "./CreateComment";
import { useBlogContext } from "../hooks/useBlogContext";

const ReadBlog = () => {
  const nav = useNavigate();
  const { id } = useParams();
  const { blog, dispatch } = useBlogContext();
  const [comments, setComments] = useState([]);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState();

  const blogsURL = `http://localhost:4000/blogs/${id}`;
  const commentsURL = `http://localhost:4000/getComments?blogId=${id}`;

  useEffect(() => {
    const getBlog = async () => {
      try {
        setIsPending(true);
        const response = await fetch(blogsURL);
        if (!response.ok) throw new Error(response.statusText);
        else console.log("Response of getBlog");
        const data = await response.json();
        dispatch({ type: "GET-BLOG", payload: data });
        setIsPending(false);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsPending(false);
      }
    };
    getBlog();
  }, [blogsURL, dispatch]);

  useEffect(() => {
    const getComments = async () => {
      const response = await fetch(commentsURL, {
        method: "GET",
        mode: "cors",
      });
      const data = await response.json();
      if (response.ok) console.log("Response of getComments");
      else return console.log(data.error);
      setComments(data);
    };

    getComments();
  }, [commentsURL, id]);

  const handleDelete = async () => {
    // remember you need to delete its comments also
    try {
      const response = await fetch(blogsURL, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        mode: "cors",
      });
      if (!response.ok) console.log(response.json().error);
      else console.log("the blog is deleted");
    } catch (error) {
      console.log(error);
    } finally {
      nav("/");
    }
  };

  return (
    <div className="blog-details">
      {error && <p>{error}</p>}
      {isPending && <p>Loading...</p>}
      {blog && (
        <div>
          <article>
            <h2>{blog.title}</h2>
            <div>Written by {blog.author}</div>
            <p>{blog.body}</p>
          </article>
          <button onClick={handleDelete}>Delete</button>

          <CreateComment blogId={id} />

          <div className="comments">
            <p>Comments</p>
            {comments.length > 0 &&
              comments.map((comment) => (
                <div className="comment" key={comment._id}>
                  <p>{comment.body}</p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadBlog;
