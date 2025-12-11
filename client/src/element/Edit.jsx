import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";

export default function Edit() {
  const { id } = useParams();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [rating, setRating] = useState("");
  const [currentImage, setCurrentImage] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    axios.get(`/movies/${id}`).then(res => {
      const m = res.data;
      setName(m.name);
      setRating(m.rating);
      setCurrentImage(m.image);
    }).catch(err => {
      console.error(err);
      alert("Failed to load");
    });
  }, [id]);

  const onFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const save = async () => {
    try {
      const body = { name, rating };
      if (preview) body.image = preview;

      await axios.put(`/movies/${id}`, body);
      nav("/");
    } catch (err) {
      console.error(err);
      alert("Failed to update");
    }
  };

  return (
    <div style={{ padding: 30 }}>
      <h1>Update movie</h1>

      <div>Movie name:</div>
      <input value={name} onChange={e => setName(e.target.value)} />

      <div style={{ marginTop: 12 }}>Rating:</div>
      <input value={rating} onChange={e => setRating(e.target.value)} />

      <div style={{ marginTop: 12 }}>Image:</div>
      <input type="file" accept="image/*" onChange={onFile} />

      <div style={{ marginTop: 12 }}>
        <img
          src={preview || currentImage}
          style={{ width: 200 }}
          alt="preview"
        />
      </div>

      <div style={{ marginTop: 20 }}>
        <button onClick={save}>Save</button>
        <Link to="/" style={{ marginLeft: 10 }}>
          <button>Back</button>
        </Link>
      </div>
    </div>
  );
}

