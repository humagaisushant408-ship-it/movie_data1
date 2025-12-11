import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";

export default function Read() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    axios.get(`/movies/${id}`).then(res => {
      setMovie(res.data);
    }).catch(err => {
      console.error(err);
      alert("Failed to load");
    });
  }, [id]);

  if (!movie) return <div style={{ padding: 30 }}>Loading...</div>;

  return (
    <div style={{ padding: 30 }}>
      <h1>{movie.name}</h1>
      {movie.image && <img src={movie.image} style={{ maxWidth: 400 }} />}
      <div><strong>Rating:</strong> {movie.rating}</div>

      <Link to="/"><button style={{ marginTop: 20 }}>Back</button></Link>
    </div>
  );
}
