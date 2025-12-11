import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await axios.get("/movies");
      setMovies(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load movies");
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    if (!window.confirm("Delete this movies?")) return;

    try {
      await axios.delete(`/movies/${id}`);
      setMovies(movies.filter(m => m.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete");
    }
  };

  return (
    <div style={{ padding: 30 }}>
      <h1 style={{ textAlign: "center" }}>Huma Movies</h1>

      <Link to="/create">
        <button>Add Movie</button>
      </Link>

      {loading ? <p>Loading...</p> : (
        <div style={{ display: "flex", gap: 40, flexWrap: "wrap", marginTop: 20 }}>
          {movies.map(m => (
            <div key={m.id} style={{ width: 260 }}>
              <img
                src={m.image}
                alt={m.name}
                style={{ width: "100%", height: 160, objectFit: "cover" }}
              />
              <div><strong>Name:</strong> {m.name}</div>
              <div><strong>Rating:</strong> {m.rating}</div>

              <div style={{ marginTop: 10 }}>
                <Link to={`/read/${m.id}`}><button>View</button></Link>
                <Link to={`/edit/${m.id}`}><button>Update</button></Link>
                <button onClick={() => remove(m.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

