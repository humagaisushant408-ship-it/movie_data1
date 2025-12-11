import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Create() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [rating, setRating] = useState("");
  const [image, setImage] = useState("");

  const onFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result);
    reader.readAsDataURL(file);
  };

  const submit = async () => {
    if (!name.trim()) return alert("Enter name");
    try {
      await axios.post("/movies", { name, rating, image });
      nav("/");
    } catch (err) {
      console.error(err);
      alert("Failed to create");
    }
  };

  return (
    <div style={{ padding: 30 }}>
      <h1>Add movie</h1>

      <div style={{ marginBottom: 12 }}>
        <div>Movie name:</div>
        <input value={name} onChange={e => setName(e.target.value)} />
      </div>

      <div style={{ marginBottom: 12 }}>
        <div>Rating:</div>
        <input value={rating} onChange={e => setRating(e.target.value)} />
      </div>

      <div style={{ marginBottom: 12 }}>
        <div>Image:</div>
        <input type="file" accept="image/*" onChange={onFile} />
        {image && <img src={image} alt="preview" style={{ width: 200 }} />}
      </div>

      <div style={{ marginTop: 20 }}>
        <button onClick={submit}>Save</button>
        <Link to="/" style={{ marginLeft: 10 }}>
          <button>Back</button>
        </Link>
      </div>
    </div>
  );
}

